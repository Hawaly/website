-- =====================================================
-- PLAN DE TESTS RLS (Row Level Security)
-- =====================================================
-- Date: 2025-12-30
-- Objectif: Vérifier que les policies RLS fonctionnent correctement
-- =====================================================

-- =====================================================
-- PRÉREQUIS: Créer des utilisateurs de test
-- =====================================================

-- Créer un client de test (si pas déjà existant)
INSERT INTO client (id, name, type, status, email)
VALUES (999, 'Client Test', 'mensuel', 'actif', 'client.test@example.com')
ON CONFLICT (id) DO NOTHING;

-- Créer un deuxième client de test
INSERT INTO client (id, name, type, status, email)
VALUES (998, 'Client Test 2', 'mensuel', 'actif', 'client2.test@example.com')
ON CONFLICT (id) DO NOTHING;

-- Créer un utilisateur admin de test
INSERT INTO app_user (id, email, password_hash, role_id, client_id, is_active)
VALUES (
  9999,
  'admin.test@yourstory.ch',
  '$2a$10$placeholder',
  1, -- role_id = 1 (admin)
  NULL,
  true
)
ON CONFLICT (email) DO UPDATE SET role_id = 1, client_id = NULL;

-- Créer un utilisateur client de test (lié au client 999)
INSERT INTO app_user (id, email, password_hash, role_id, client_id, is_active)
VALUES (
  9998,
  'client.test@example.com',
  '$2a$10$placeholder',
  2, -- role_id = 2 (client)
  999, -- Lié au client_id 999
  true
)
ON CONFLICT (email) DO UPDATE SET role_id = 2, client_id = 999;

-- Créer un utilisateur client 2 de test (lié au client 998)
INSERT INTO app_user (id, email, password_hash, role_id, client_id, is_active)
VALUES (
  9997,
  'client2.test@example.com',
  '$2a$10$placeholder',
  2, -- role_id = 2 (client)
  998, -- Lié au client_id 998
  true
)
ON CONFLICT (email) DO UPDATE SET role_id = 2, client_id = 998;

-- Créer des factures de test
INSERT INTO invoice (id, client_id, invoice_number, issue_date, total_ht, total_tva, total_ttc, status)
VALUES 
  (9999, 999, 'INV-TEST-001', '2025-12-01', 1000.00, 77.00, 1077.00, 'envoyee'),
  (9998, 998, 'INV-TEST-002', '2025-12-01', 2000.00, 154.00, 2154.00, 'envoyee')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- TEST 1: ADMIN - Doit voir TOUTES les factures
-- =====================================================

-- Simuler connexion admin (user_id = 9999)
SET LOCAL app.current_user_id = '9999';

-- Test: Admin doit voir toutes les factures
SELECT 
  '=== TEST 1: ADMIN - Voir toutes factures ===' as test_name,
  id,
  client_id,
  invoice_number,
  total_ttc
FROM invoice
WHERE id IN (9999, 9998)
ORDER BY id;

-- Résultat attendu: 2 lignes (factures 9999 et 9998)

-- =====================================================
-- TEST 2: CLIENT 1 - Doit voir UNIQUEMENT ses factures
-- =====================================================

-- Simuler connexion client 1 (user_id = 9998, client_id = 999)
SET LOCAL app.current_user_id = '9998';

-- Test: Client 1 doit voir uniquement sa facture
SELECT 
  '=== TEST 2: CLIENT 1 - Voir ses propres factures ===' as test_name,
  id,
  client_id,
  invoice_number,
  total_ttc
FROM invoice
WHERE id IN (9999, 9998)
ORDER BY id;

-- Résultat attendu: 1 ligne (facture 9999 avec client_id = 999)

-- =====================================================
-- TEST 3: CLIENT 2 - Doit voir UNIQUEMENT ses factures
-- =====================================================

-- Simuler connexion client 2 (user_id = 9997, client_id = 998)
SET LOCAL app.current_user_id = '9997';

-- Test: Client 2 doit voir uniquement sa facture
SELECT 
  '=== TEST 3: CLIENT 2 - Voir ses propres factures ===' as test_name,
  id,
  client_id,
  invoice_number,
  total_ttc
FROM invoice
WHERE id IN (9999, 9998)
ORDER BY id;

-- Résultat attendu: 1 ligne (facture 9998 avec client_id = 998)

-- =====================================================
-- TEST 4: CLIENT - Isolation cross-tenant
-- =====================================================

-- Client 1 essaie d'accéder à la facture du Client 2
SET LOCAL app.current_user_id = '9998';

-- Test: Doit retourner 0 ligne (isolation tenant)
SELECT 
  '=== TEST 4: CLIENT 1 - Essai accès cross-tenant ===' as test_name,
  COUNT(*) as factures_visibles,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ SÉCURISÉ: Aucun accès cross-tenant'
    ELSE '❌ FAILLE: Accès cross-tenant détecté!'
  END as resultat
FROM invoice
WHERE id = 9998; -- Facture du client 2

-- Résultat attendu: 0 ligne, message SÉCURISÉ

-- =====================================================
-- TEST 5: CLIENT - Tentative UPDATE cross-tenant
-- =====================================================

-- Client 1 essaie de modifier une facture du Client 2
SET LOCAL app.current_user_id = '9998';

-- Test: Doit échouer (0 rows affected)
UPDATE invoice
SET status = 'payee'
WHERE id = 9998; -- Facture du client 2

-- Vérifier que la facture n'a PAS été modifiée
SELECT 
  '=== TEST 5: CLIENT 1 - Tentative UPDATE cross-tenant ===' as test_name,
  id,
  status,
  CASE 
    WHEN status != 'payee' THEN '✅ SÉCURISÉ: UPDATE bloqué'
    ELSE '❌ FAILLE: UPDATE autorisé!'
  END as resultat
FROM invoice
WHERE id = 9998;

-- Résultat attendu: status = 'envoyee' (pas 'payee')

-- =====================================================
-- TEST 6: ADMIN - Modification autorisée
-- =====================================================

-- Admin modifie une facture
SET LOCAL app.current_user_id = '9999';

-- Test: Doit réussir
UPDATE invoice
SET status = 'payee'
WHERE id = 9998;

-- Vérifier que la modification a réussi
SELECT 
  '=== TEST 6: ADMIN - UPDATE autorisé ===' as test_name,
  id,
  status,
  CASE 
    WHEN status = 'payee' THEN '✅ OK: Admin peut modifier'
    ELSE '❌ ERREUR: Admin bloqué!'
  END as resultat
FROM invoice
WHERE id = 9998;

-- Résultat attendu: status = 'payee'

-- Remettre à l'état initial
UPDATE invoice SET status = 'envoyee' WHERE id = 9998;

-- =====================================================
-- TEST 7: CLIENT - Accès aux tables liées (invoice_item)
-- =====================================================

-- Créer des items de facture de test
INSERT INTO invoice_item (id, invoice_id, description, quantity, unit_price, total)
VALUES 
  (9999, 9999, 'Service Test 1', 1, 1000.00, 1000.00),
  (9998, 9998, 'Service Test 2', 1, 2000.00, 2000.00)
ON CONFLICT (id) DO NOTHING;

-- Client 1 doit voir uniquement les items de ses factures
SET LOCAL app.current_user_id = '9998';

SELECT 
  '=== TEST 7: CLIENT 1 - Voir items de ses factures ===' as test_name,
  ii.id,
  ii.invoice_id,
  ii.description,
  ii.total
FROM invoice_item ii
WHERE ii.id IN (9999, 9998)
ORDER BY ii.id;

-- Résultat attendu: 1 ligne (item 9999, invoice_id = 9999)

-- =====================================================
-- TEST 8: CLIENT - Accès aux tables strategy
-- =====================================================

-- Créer une stratégie de test
INSERT INTO social_media_strategy (id, client_id, version, status, contexte_general)
VALUES 
  (9999, 999, 1, 'actif', 'Stratégie test client 1'),
  (9998, 998, 1, 'actif', 'Stratégie test client 2')
ON CONFLICT (id) DO NOTHING;

-- Client 1 doit voir uniquement sa stratégie
SET LOCAL app.current_user_id = '9998';

SELECT 
  '=== TEST 8: CLIENT 1 - Voir sa stratégie ===' as test_name,
  id,
  client_id,
  contexte_general,
  CASE 
    WHEN COUNT(*) OVER () = 1 THEN '✅ SÉCURISÉ'
    ELSE '❌ FAILLE'
  END as resultat
FROM social_media_strategy
WHERE id IN (9999, 9998)
ORDER BY id;

-- Résultat attendu: 1 ligne (stratégie 9999, client_id = 999)

-- =====================================================
-- TEST 9: CLIENT - Accès company_settings (lecture seule)
-- =====================================================

-- Client peut lire company_settings
SET LOCAL app.current_user_id = '9998';

SELECT 
  '=== TEST 9: CLIENT - Lecture company_settings ===' as test_name,
  id,
  agency_name,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ OK: Lecture autorisée'
    ELSE '❌ ERREUR: Lecture bloquée'
  END as resultat
FROM company_settings
LIMIT 1;

-- Résultat attendu: 1 ligne visible

-- Test: Client ne peut PAS modifier company_settings
UPDATE company_settings
SET agency_name = 'HACK ATTEMPT'
WHERE id = 1;

-- Vérifier que la modification a échoué
SELECT 
  '=== TEST 9b: CLIENT - Tentative UPDATE company_settings ===' as test_name,
  agency_name,
  CASE 
    WHEN agency_name != 'HACK ATTEMPT' THEN '✅ SÉCURISÉ: UPDATE bloqué'
    ELSE '❌ FAILLE: UPDATE autorisé!'
  END as resultat
FROM company_settings
WHERE id = 1;

-- Résultat attendu: agency_name != 'HACK ATTEMPT'

-- =====================================================
-- TEST 10: Fonction helper - current_user_role_id()
-- =====================================================

-- Test avec admin
SET LOCAL app.current_user_id = '9999';

SELECT 
  '=== TEST 10a: Helper - Admin role_id ===' as test_name,
  auth.current_user_role_id() as role_id,
  auth.is_admin() as is_admin,
  auth.is_client() as is_client,
  CASE 
    WHEN auth.current_user_role_id() = 1 THEN '✅ OK'
    ELSE '❌ ERREUR'
  END as resultat;

-- Résultat attendu: role_id = 1, is_admin = true, is_client = false

-- Test avec client
SET LOCAL app.current_user_id = '9998';

SELECT 
  '=== TEST 10b: Helper - Client role_id ===' as test_name,
  auth.current_user_role_id() as role_id,
  auth.current_user_client_id() as client_id,
  auth.is_admin() as is_admin,
  auth.is_client() as is_client,
  CASE 
    WHEN auth.current_user_role_id() = 2 AND auth.current_user_client_id() = 999 THEN '✅ OK'
    ELSE '❌ ERREUR'
  END as resultat;

-- Résultat attendu: role_id = 2, client_id = 999, is_admin = false, is_client = true

-- =====================================================
-- TEST 11: Expense - Type "yourstory" invisible aux clients
-- =====================================================

-- Créer des dépenses de test
INSERT INTO expense (id, type, label, amount, date, client_id)
VALUES 
  (9999, 'client_mandat', 'Dépense client 1', 100.00, '2025-12-01', 999),
  (9998, 'yourstory', 'Dépense interne agence', 500.00, '2025-12-01', NULL)
ON CONFLICT (id) DO NOTHING;

-- Client 1 doit voir uniquement ses dépenses client_mandat
SET LOCAL app.current_user_id = '9998';

SELECT 
  '=== TEST 11: CLIENT - Isolation dépenses yourstory ===' as test_name,
  id,
  type,
  label,
  amount,
  COUNT(*) OVER () as total_visible,
  CASE 
    WHEN COUNT(*) OVER () = 1 AND type = 'client_mandat' THEN '✅ SÉCURISÉ'
    ELSE '❌ FAILLE'
  END as resultat
FROM expense
WHERE id IN (9999, 9998)
ORDER BY id;

-- Résultat attendu: 1 ligne (dépense 9999, type = 'client_mandat')

-- =====================================================
-- RÉSUMÉ DES TESTS
-- =====================================================

SELECT 
  '=== RÉSUMÉ RLS TESTS ===' as section,
  '11 scénarios de test exécutés' as info;

SELECT 
  'Test' as num,
  'Description' as description,
  'Attendu' as resultat_attendu
UNION ALL
SELECT '1', 'Admin voit toutes factures', '2 lignes'
UNION ALL
SELECT '2', 'Client 1 voit sa facture', '1 ligne (9999)'
UNION ALL
SELECT '3', 'Client 2 voit sa facture', '1 ligne (9998)'
UNION ALL
SELECT '4', 'Client 1 isolation cross-tenant SELECT', '0 ligne'
UNION ALL
SELECT '5', 'Client 1 isolation cross-tenant UPDATE', 'Bloqué'
UNION ALL
SELECT '6', 'Admin peut UPDATE', 'Réussi'
UNION ALL
SELECT '7', 'Client voit ses invoice_items', '1 ligne'
UNION ALL
SELECT '8', 'Client voit sa stratégie', '1 ligne'
UNION ALL
SELECT '9', 'Client lit company_settings', 'Lecture OK, UPDATE bloqué'
UNION ALL
SELECT '10', 'Helpers role_id fonctionnent', 'Admin=1, Client=2'
UNION ALL
SELECT '11', 'Dépenses yourstory invisibles', 'Client voit que ses dépenses';

-- =====================================================
-- NETTOYAGE (optionnel)
-- =====================================================

-- Décommenter pour supprimer les données de test
/*
DELETE FROM invoice_item WHERE id IN (9999, 9998);
DELETE FROM invoice WHERE id IN (9999, 9998);
DELETE FROM social_media_strategy WHERE id IN (9999, 9998);
DELETE FROM expense WHERE id IN (9999, 9998);
DELETE FROM app_user WHERE id IN (9999, 9998, 9997);
DELETE FROM client WHERE id IN (999, 998);
*/

-- =====================================================
-- FIN DES TESTS
-- =====================================================

RAISE NOTICE '==============================================';
RAISE NOTICE 'Tests RLS terminés!';
RAISE NOTICE 'Vérifiez que tous les résultats affichent ✅';
RAISE NOTICE '==============================================';
