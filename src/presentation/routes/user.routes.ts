import { Router } from "express";
import { Container } from "inversify";
import { UserController } from "../controllers/user.controller";
import { catchAsync } from "../../shared/utils/catch-async.util";

export function userRoutes(container: Container): Router {
    const router = Router();
    const userController = container.get<UserController>("UserController");

    router.get(
        "/",
        catchAsync(userController.findMany)
    );
    router.get(
        "/:id",
        catchAsync(userController.findById)
    );
    router.patch(
        "/:id",
        catchAsync(userController.update)
    );
    router.delete(
        "/:id",
        catchAsync(userController.delete)
    );

    return router;
}
