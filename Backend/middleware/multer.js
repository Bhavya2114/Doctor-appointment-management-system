import multer from "multer";

const storage = multer.diskStorage({
    filename: function (req, file, callback) {
        callback(null, file.originalname)
    }
});

const upload = multer({ storage: storage })

export default upload

/*

Responsibility: Handle file uploads (images)
Used on: Routes that accept files (add doctor, update profile)
Not authentication — different purpose entirely

How Multer Works (FLOW)
1. Client sends multipart/form-data request
   ↓
2. Multer intercepts request
   ↓
3. Extracts file from request
   ↓
4. Saves to disk (temp folder)
   ↓
5. Adds to req.file:
   {
       fieldname: 'image',
       originalname: 'profile.jpg',
       path: '/tmp/uploads/profile.jpg',
       size: 12345
   }
   ↓
6. Controller accesses req.file
   ↓
7. Uploads to Cloudinary
   ↓
8. Deletes temp file

*/