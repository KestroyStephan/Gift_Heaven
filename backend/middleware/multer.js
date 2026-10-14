import multer from 'multer'

const storage = multer.diskStorage({
    filename:function(req,file,callback){
        callback(null, Date.now() + '-' + file.originalname)
    }
})

const fileFilter = (req, file, callback) => {
    if (file.mimetype.startsWith('image/')) callback(null, true)
    else callback(new Error('Only image files are allowed'))
}

const upload = multer({storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 }})

export default upload
