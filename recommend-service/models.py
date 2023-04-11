from pydantic import BaseModel
from bson.objectid import ObjectId as BsonObjectId


class PydanticObjectId(BsonObjectId):
  @classmethod
  def __get_validators__(cls):
    yield cls.validate

  @classmethod
  def validate(cls, v):
    if not isinstance(v, BsonObjectId):
      raise TypeError('ObjectId required')
    return str(v)


class Transaction(BaseModel):
  _id: PydanticObjectId
  productIds: list[PydanticObjectId]


class CreateAssociationRuleParams(BaseModel):
  min_support: float
  min_confidence: float