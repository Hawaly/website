"use client";

import { useState, useEffect } from "react";
import { Calendar, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Expense,
  ExpenseCategory
} from "@/types/database";
import { formatAmount } from "@/lib/expenseHelpers";

type ExpenseWithCategory = Expense & {
  category: ExpenseCategory | null;
};

interface ExpensesListProps {
  clientId?: number;
  mandatId?: number;
}

export function ExpensesList({ clientId, mandatId }: ExpensesListProps) {
  const [expenses, setExpenses] = useState<ExpenseWithCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, mandatId]);

  async function loadExpenses() {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from("expense")
        .select(`
          *,
          category:category_id (*)
        `)
        .order("date", { ascending: false });

      if (clientId) {
        query = query.eq("client_id", clientId);
      }

      if (mandatId) {
        query = query.eq("mandat_id", mandatId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setExpenses(data || []);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Erreur lors du chargement des dépenses");
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
        <p className="text-red-900 font-semibold text-sm">{error}</p>
      </div>
    );
  }

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">
          Dépenses ({expenses.length})
        </h3>
        <div className="text-lg font-black text-gray-900">
          Total : {formatAmount(total)}
        </div>
      </div>

      {expenses.length === 0 ? (
        <p className="text-gray-900 text-center py-8 font-semibold">
          Aucune dépense associée
        </p>
      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200 hover:border-blue-400 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900">{expense.label}</h4>
                  {expense.category && (
                    <p className="text-sm text-gray-800 font-medium">
                      {expense.category.name}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-black text-gray-900 text-lg">
                    {formatAmount(expense.amount)}
                  </div>
                  {expense.is_recurring === 'mensuel' && (
                    <span className="text-xs text-orange-700 font-bold">
                      🔄 Mensuelle
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-700 font-medium">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(expense.date).toLocaleDateString("fr-FR")}
                </div>

                {expense.receipt_path && (
                  <a
                    href={`/api/expenses/${expense.id}/receipt`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-700 hover:text-blue-900 font-bold hover:underline"
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Justificatif
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

