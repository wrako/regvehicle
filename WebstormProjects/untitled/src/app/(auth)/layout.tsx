import { Ambulance } from "lucide-react";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <div className="flex justify-center">
            <Ambulance className="h-12 w-auto text-primary" />
          </div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            EMS Vehicle Registry
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Emergency Medical Services Registration System
          </p>
        </div>
        {children}
        <p className="mt-8 text-center text-xs text-gray-500">
          Emergency Medical Services Registry System v1.0
          <br />
          Powered by Ministry of Health of the Slovak Republic
        </p>
      </div>
    </div>
  );
}
