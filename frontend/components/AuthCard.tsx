
"use client";

export default function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white/80 backdrop-blur shadow-xl border border-gray-100 p-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {title}
        </h1>

        {subtitle && (
          <p className="text-gray-600 text-sm mt-2">
            {subtitle}
          </p>
        )}

        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
