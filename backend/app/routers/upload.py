from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.user import User
from ..utils.dependencies import get_current_user_required
from ..utils.cloudinary import upload_image, delete_image

router = APIRouter(prefix="/upload", tags=["Upload"])


@router.post("/image")
async def upload_single_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user_required)
):
    """Upload a single image and return the URL"""
    result = await upload_image(file, folder="unicycle/listings")
    return result


@router.post("/images")
async def upload_multiple_images(
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user_required)
):
    """Upload multiple images and return their URLs"""
    if len(files) > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 5 images allowed"
        )
    
    results = []
    for file in files:
        result = await upload_image(file, folder="unicycle/listings")
        results.append(result)
    
    return {"images": results}


@router.delete("/image/{public_id:path}")
async def delete_uploaded_image(
    public_id: str,
    current_user: User = Depends(get_current_user_required)
):
    """Delete an uploaded image"""
    success = await delete_image(public_id)
    if success:
        return {"message": "Image deleted successfully"}
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete image"
        )