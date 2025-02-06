Folders:

src/=> config/ => database,enviroment(ex:db.js).
controllers/ => route handler logic(ex:authController.js,userController.js).
middlewares/ => custom middleware(ex:authMiddleware.js,erorHandler.js).
models/ => data base models/schemas(ex:User.js,Post.js).
routes/ => route definitions(ex:authRoutes.js,userRoutes.js).
services/ => business logic or external API calls(authService.js,emailService.js).
utils/ =>utility functions/helpers
public/ =>Static files (ex:photos, videos,CSS,JS).

Files:

.app.js => Express app setup
.env =>Enviroment documentation.