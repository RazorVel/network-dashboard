import config from "../config.cjs";
import generalRoute from "../routes/general.routes.js";

const APP_PORT = config.get("backend-services.port")

export default function (app) {
    app.listen(APP_PORT, () => {
        console.log(`Server is running on port ${APP_PORT}`);
    })

    generalRoute(app);
}
