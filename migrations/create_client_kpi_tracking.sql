-- Migration: Création de la table de suivi des KPIs clients
-- Cette table permet de suivre les KPIs de chaque client de manière autonome
-- Les KPIs peuvent être mis à jour régulièrement par l'admin et consultés par le client

-- Table client_kpi: définition des KPIs à suivre pour un client
CREATE TABLE IF NOT EXISTS client_kpi (
    id BIGSERIAL PRIMARY KEY,
    client_id BIGINT NOT NULL REFERENCES client(id) ON DELETE CASCADE,
    
    -- Informations du KPI
    nom VARCHAR(255) NOT NULL,
    description TEXT,
    categorie VARCHAR(100), -- ex: 'social_media', 'website', 'sales', 'engagement'
    unite VARCHAR(50), -- ex: 'followers', '%', 'CHF', 'visites', 'leads'
    
    -- Objectif
    valeur_cible NUMERIC(12,2),
    periodicite VARCHAR(50), -- ex: 'mensuel', 'hebdomadaire', 'trimestriel', 'annuel'
    
    -- Ordre d'affichage
    ordre INTEGER DEFAULT 0,
    
    -- Actif/Inactif
    is_active BOOLEAN DEFAULT true,
    
    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table client_kpi_value: valeurs mesurées dans le temps pour chaque KPI
CREATE TABLE IF NOT EXISTS client_kpi_value (
    id BIGSERIAL PRIMARY KEY,
    kpi_id BIGINT NOT NULL REFERENCES client_kpi(id) ON DELETE CASCADE,
    
    -- Mesure
    date DATE NOT NULL,
    valeur_mesuree NUMERIC(12,2) NOT NULL,
    commentaire TEXT,
    
    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255), -- Email de l'utilisateur qui a créé la mesure
    
    -- Contrainte unique: une seule mesure par KPI par date
    UNIQUE(kpi_id, date)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_client_kpi_client_id ON client_kpi(client_id);
CREATE INDEX IF NOT EXISTS idx_client_kpi_active ON client_kpi(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_client_kpi_value_kpi_id ON client_kpi_value(kpi_id);
CREATE INDEX IF NOT EXISTS idx_client_kpi_value_date ON client_kpi_value(date DESC);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_client_kpi_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_client_kpi_updated_at
    BEFORE UPDATE ON client_kpi
    FOR EACH ROW
    EXECUTE FUNCTION update_client_kpi_updated_at();

-- Commentaires pour documentation
COMMENT ON TABLE client_kpi IS 'KPIs à suivre pour chaque client';
COMMENT ON TABLE client_kpi_value IS 'Valeurs mesurées dans le temps pour chaque KPI client';

-- RLS (Row Level Security) - À adapter selon votre politique de sécurité
ALTER TABLE client_kpi ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_kpi_value ENABLE ROW LEVEL SECURITY;

-- Policy pour les admins (accès complet)
CREATE POLICY "Admins can do everything on client_kpi"
    ON client_kpi
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM app_user 
            WHERE app_user.id = (auth.jwt() -> 'user_metadata' ->> 'app_user_id')::bigint
            AND app_user.role_code IN ('ADMIN', 'SUPER_ADMIN')
        )
    );

CREATE POLICY "Admins can do everything on client_kpi_value"
    ON client_kpi_value
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM app_user 
            WHERE app_user.id = (auth.jwt() -> 'user_metadata' ->> 'app_user_id')::bigint
            AND app_user.role_code IN ('ADMIN', 'SUPER_ADMIN')
        )
    );

-- Policy pour les clients (lecture seule de leurs propres KPIs)
CREATE POLICY "Clients can view their own KPIs"
    ON client_kpi
    FOR SELECT
    USING (
        client_id IN (
            SELECT client_id FROM app_user 
            WHERE app_user.id = (auth.jwt() -> 'user_metadata' ->> 'app_user_id')::bigint
            AND app_user.role_code = 'CLIENT'
        )
    );

CREATE POLICY "Clients can view their own KPI values"
    ON client_kpi_value
    FOR SELECT
    USING (
        kpi_id IN (
            SELECT id FROM client_kpi 
            WHERE client_id IN (
                SELECT client_id FROM app_user 
                WHERE app_user.id = (auth.jwt() -> 'user_metadata' ->> 'app_user_id')::bigint
                AND app_user.role_code = 'CLIENT'
            )
        )
    );
