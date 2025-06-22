import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary, uploadMultipleToCloudinary, deleteFromCloudinary } from '../../../lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const action = formData.get('action') as string;

    switch (action) {
      case 'upload-single': {
        const file = formData.get('file') as File;
        const folder = formData.get('folder') as string || 'nexus';
        const resourceType = formData.get('resource_type') as 'image' | 'video' | 'raw' | 'auto' || 'auto';

        if (!file) {
          return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const result = await uploadToCloudinary(buffer, {
          folder,
          resource_type: resourceType,
          public_id: `${folder}_${Date.now()}_${file.name.split('.')[0]}`,
        });

        return NextResponse.json({
          success: true,
          data: result,
        });
      }

      case 'upload-multiple': {
        const files = formData.getAll('files') as File[];
        const folder = formData.get('folder') as string || 'nexus';
        const resourceType = formData.get('resource_type') as 'image' | 'video' | 'raw' | 'auto' || 'auto';

        if (!files || files.length === 0) {
          return NextResponse.json({ error: 'No files provided' }, { status: 400 });
        }

        const buffers = await Promise.all(
          files.map(async (file) => {
            const bytes = await file.arrayBuffer();
            return Buffer.from(bytes);
          })
        );

        const results = await uploadMultipleToCloudinary(buffers, {
          folder,
          resource_type: resourceType,
        });

        return NextResponse.json({
          success: true,
          data: results,
        });
      }

      case 'upload-base64': {
        const base64Data = formData.get('base64') as string;
        const folder = formData.get('folder') as string || 'nexus';
        const resourceType = formData.get('resource_type') as 'image' | 'video' | 'raw' | 'auto' || 'auto';

        if (!base64Data) {
          return NextResponse.json({ error: 'No base64 data provided' }, { status: 400 });
        }

        const result = await uploadToCloudinary(base64Data, {
          folder,
          resource_type: resourceType,
        });

        return NextResponse.json({
          success: true,
          data: result,
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('public_id');

    if (!publicId) {
      return NextResponse.json({ error: 'Public ID is required' }, { status: 400 });
    }

    const result = await deleteFromCloudinary(publicId);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Delete failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}