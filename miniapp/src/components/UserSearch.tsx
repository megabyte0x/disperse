import { useState, useEffect, useRef } from "react";
import { searchUser } from "~/lib/neynar";
import { Input } from "~/components/ui/input";
import type { SearchedUser } from "@neynar/nodejs-sdk/build/api";

interface UserSearchProps {
    onSelectUser: (address: string) => void;
}

export default function UserSearch({ onSelectUser }: UserSearchProps) {
    const [query, setQuery] = useState("");
    const [users, setUsers] = useState<SearchedUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            if (query.length > 0) {
                setLoading(true);
                const results = await searchUser(query);
                setUsers(results);
                setLoading(false);
                setShowDropdown(true);
            } else {
                setUsers([]);
                setShowDropdown(false);
            }
        };

        const debounceTimer = setTimeout(() => {
            fetchUsers();
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [query]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (user: SearchedUser) => {
        // Extract and use the user's custody address
        if (user.custody_address) {
            onSelectUser(user.custody_address);
            setQuery("");
            setShowDropdown(false);
        }
    };

    return (
        <div className="relative w-full mb-4">
            <Input
                type="text"
                placeholder="Search Farcaster username..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full"
                aria-label="Search for Farcaster users"
                aria-expanded={showDropdown}
                aria-controls={showDropdown ? "user-search-results" : undefined}
            />

            {showDropdown && users.length > 0 && (
                <div
                    ref={dropdownRef}
                    className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto"
                    id="user-search-results"
                >
                    <ul className="list-none p-0 m-0">
                        {users.map((user) => (
                            <li key={user.fid}>
                                <button
                                    type="button"
                                    className="flex items-center p-2 w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                    onClick={() => handleSelect(user)}
                                >
                                    {user.pfp_url && (
                                        <img
                                            src={user.pfp_url}
                                            alt={`${user.username}'s profile`}
                                            className="w-8 h-8 rounded-full mr-2"
                                        />
                                    )}
                                    <div>
                                        <div className="font-medium">{user.display_name}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</div>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {loading && (
                <div className="absolute right-3 top-3">
                    <span className="animate-spin h-4 w-4 border-2 border-gray-500 rounded-full border-t-transparent block" />
                </div>
            )}
        </div>
    );
} 