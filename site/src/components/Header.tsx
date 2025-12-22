import { cn } from "@/lib/utils"

const Pages = ["less", "more"]

export default function Header({ active }: { active?: "less" | "more" }) {
    return (
        <div className="flex items-center max-w-3xl space-x-2 w-full">
            <div className="group/nav flex flex-col">
                {Pages.map((page) => (
                    <a key={page} href={`/${page}`} className="group/item flex items-center">
                        <div className="w-6 flex justify-center">
                            <img
                                src="/public/SidewaysFork.png"
                                alt=""
                                className={cn(
                                    "transition-opacity", {
                                        "opacity-100 group-hover/nav:opacity-0 group-hover/item:!opacity-100": page === active,
                                        "opacity-0 group-hover/item:opacity-100": page !== active
                                    }
                                )}
                            />
                        </div>
                        <span
                            className={cn(
                                "text-xl tracking-tight transition-colors group-hover/item:text-white",
                                page === active ? "text-white" : "text-white/60"
                            )}
                        >
                            {page}
                        </span>
                    </a>
                ))}
            </div>
            <img className="mt-5" src="/public/LogoJoined.png" alt="" />
        </div>
    )
}
