from fastapi import FastAPI, status, Depends

from fastapi.middleware.cors import CORSMiddleware

from pymongo import MongoClient

from bson.objectid import ObjectId as BsonObjectId

from models import Transaction, CreateAssociationRuleParams

from process_data import generate_association_rules

from functools import lru_cache

from typing_extensions import Annotated

from config import Settings


app = FastAPI()

origins = [
  "http://localhost:3000",
]

app.add_middleware(
  CORSMiddleware,
  allow_origins=origins,
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

@lru_cache()
def get_settings():
  return Settings()


def get_database(connection_string):
  """Kết nối với database"""

  # Tạo connection
  client = MongoClient(connection_string)

  # Kết nối với database
  return client.get_database('do_an_tot_nghiep')


def fetch_transactions(transaction_collection):
  """Lấy đơn hàng"""

  transaction_docs = transaction_collection.find()
  transactions = []
  for transaction_doc in transaction_docs:
    items = []
    transaction = Transaction(**transaction_doc)
    for item in transaction.productIds:
      items.append(item)
    transactions.append(items)  
  return transactions


def insert_association_rules(association_rule_collection, association_rules):
  """Lưu luật kết hợp vào database"""

  records = []

  for rule in association_rules.itertuples():
    antecedents = []
    consequents = []
    for id_item in rule.antecedents:
      antecedents.append(BsonObjectId(id_item))
    for id_item in rule.consequents:
      consequents.append(BsonObjectId(id_item))
    record = {
      'antecedents': antecedents,
      'consequents': consequents,
      'antecedentSupport': rule._3,
      'consequentSupport': rule._4,
      'support': rule.support,
      'confidence': rule.confidence,
      'lift': rule.lift
    }
    records.append(record)
  if len(records) == 0:
    return False
  association_rule_collection.delete_many({})
  association_rule_collection.insert_many(records)
  return True


@app.post("/api/v1/recommend-service", status_code=status.HTTP_201_CREATED)
def create_association_rules(params: CreateAssociationRuleParams, settings: Annotated[Settings, Depends(get_settings)]):
  # Connect database
  db = get_database(settings.connection_string)

  # Connect collection
  transaction_collection = db.get_collection('Transaction')
  association_rule_collection = db.get_collection('AssociationRule')

  # Lấy các đơn hàng
  transactions = fetch_transactions(transaction_collection)

  # Lấy luật kết hợp
  association_rules = generate_association_rules(transactions=transactions, min_support=params.min_support, min_confidence=params.min_confidence)

  # Lưu luật kết hợp và database
  result = insert_association_rules(association_rule_collection=association_rule_collection, association_rules=association_rules)

  return result

