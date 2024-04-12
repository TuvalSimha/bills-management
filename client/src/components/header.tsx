

import React from "react";

interface HeaderProps extends React.HTMLAttributes<HTMLElement> { }

type item = {
    name: string;
    href: string;
}


const navItems: item[] = [
    { name: "Home", href: "/" },
    { name: "All Bills", href: "/bills" },
    { name: "Contact", href: "/contact" },
]


export function NavBar({ className, ...props }: HeaderProps) {
    return (
        <div className="hidden flex-col md:flex">
            <div className="border-b">
                <div className="flex h-16 items-center px-4">
                    <div className="flex items-center space-x-4">
                        <a href="/" className="text-xl font-bold">Bill Management</a>
                        <nav className="flex space-x-4">
                            {navItems.map((item) => (
                                <a key={item.name} href={item.href} className="text-sm font-medium text-gray-900 hover:text-gray-700">
                                    {item.name}
                                </a>
                            ))}
                        </nav>
                    </div>
                    <div className="flex ml-auto space-x-4">
                        <a href="/profile" className="text-sm font-medium text-gray-900 hover:text-gray-700">Profile</a>
                    </div>
                </div>
            </div>
        </div>
    );
}