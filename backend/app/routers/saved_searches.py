from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from ..database import get_db
from ..models.saved_search import SavedSearch
from ..utils.dependencies import get_current_user_required
from ..models.user import User

router = APIRouter(prefix="/saved-searches", tags=["Saved Searches"])


class SavedSearchCreate(BaseModel):
    query: Optional[str] = None
    category: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    condition: Optional[str] = None
    university: Optional[str] = None


class SavedSearchResponse(BaseModel):
    id: int
    query: Optional[str]
    category: Optional[str]
    min_price: Optional[float]
    max_price: Optional[float]
    condition: Optional[str]
    university: Optional[str]

    class Config:
        from_attributes = True


@router.post("/", response_model=SavedSearchResponse, status_code=status.HTTP_201_CREATED)
def create_saved_search(
    data: SavedSearchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Save the current search/filter state for later alerts."""
    saved = SavedSearch(
        user_id=current_user.id,
        query=data.query or None,
        category=data.category if data.category and data.category != "All" else None,
        min_price=data.min_price,
        max_price=data.max_price,
        condition=data.condition if data.condition and data.condition != "All" else None,
        university=data.university,
    )
    db.add(saved)
    db.commit()
    db.refresh(saved)
    return saved


@router.get("/", response_model=List[SavedSearchResponse])
def get_saved_searches(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """List current user's saved searches."""
    return db.query(SavedSearch).filter(SavedSearch.user_id == current_user.id).all()


@router.delete("/{search_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_saved_search(
    search_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """Delete a saved search (owner only)."""
    saved = db.query(SavedSearch).filter(SavedSearch.id == search_id).first()
    if not saved:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Saved search not found")
    if saved.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    db.delete(saved)
    db.commit()
    return None
