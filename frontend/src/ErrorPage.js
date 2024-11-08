import {useRouteError} from "react-router-dom";

export default function ErrorPage() {
    const error = useRouteError();
    console.error(error);

    return (
        <div id={"error-page"}>
            <h1>Oops!, the page you are looking for does not exist.</h1>
            <p>
                <i>{error.statusText || error.message}</i>
            </p>
        </div>
    )
}