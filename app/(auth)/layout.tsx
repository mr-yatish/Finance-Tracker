export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-zinc-900">
            {children}
        </div>
    )
}
