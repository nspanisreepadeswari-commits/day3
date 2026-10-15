from pydantic import BaseModel, ConfigDict, Field

class TaskCreate(BaseModel):
    title: str = Field(..., max_length=100)

class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, max_length=100)
    completed: bool | None = Field(default=None)

class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    completed: bool