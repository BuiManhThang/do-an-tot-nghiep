import pandas as pd
from mlxtend.preprocessing import TransactionEncoder
from mlxtend.frequent_patterns import fpgrowth
from mlxtend.frequent_patterns import association_rules

def generate_association_rules(transactions, min_support=0.02, min_confidence=0.1):
  """Tạo tập kết hợp"""

  # Mã hóa dữ liệu
  te = TransactionEncoder()
  te_arr = te.fit(transactions).transform(transactions)
  dataset = pd.DataFrame(te_arr, columns=te.columns_)
  
  # Tạo tập phổ biển
  frequent_itemsets = fpgrowth(dataset, min_support=min_support, use_colnames=True)

  # Trích xuất luật kết hợp từ tập phổ biến
  rules = association_rules(frequent_itemsets, metric="confidence", min_threshold=min_confidence)
  return rules
  
