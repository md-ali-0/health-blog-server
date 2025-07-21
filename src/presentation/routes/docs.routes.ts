import { Router } from "express";
import path from "path";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

export function docsRoutes(): Router {
    const router = Router();
    const swaggerDocument = YAML.load(
        path.join(process.cwd(), "docs/api.yaml")
    );

    const options = {
        customCss: ".swagger-ui .topbar { display: none }",
        customSiteTitle: "Blog API Documentation",
    };

    router.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));

    return router;
}
