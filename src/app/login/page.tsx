import LoginView from "@/components/views/LoginView";
import { Suspense } from "react";

export default async function LoginPage() {
    return (
        <Suspense>
            <LoginView />
        </Suspense>
    );
}
