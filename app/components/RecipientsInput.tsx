"use client";

import { useState, useEffect } from "react";
import { isAddress } from "viem";

interface Recipient {
    address: string;
    amount: string;
    valid: boolean;
}

interface RecipientsInputProps {
    onRecipientsChange: (recipients: Recipient[]) => void;
    // tokenDecimals is passed for future use but not currently used in this component
    tokenDecimals: number;
}

export default function RecipientsInput({
    onRecipientsChange,
    tokenDecimals, // Keeping this parameter for future use with token-specific calculations
}: RecipientsInputProps) {
    const [textareaValue, setTextareaValue] = useState<string>("");
    const [recipients, setRecipients] = useState<Recipient[]>([]);
    const [error, setError] = useState<string>("");
    const [processingText, setProcessingText] = useState(false);

    // Process text area input
    useEffect(() => {
        if (!processingText) {
            return;
        }

        setError("");

        // Split by new line and filter out empty lines
        const lines = textareaValue
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.length > 0);

        const parsedRecipients: Recipient[] = [];
        let hasInvalidLine = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Split by comma, space, or tab
            const parts = line.split(/[ ,\t]+/).filter((part) => part.length > 0);

            if (parts.length !== 2) {
                setError(`Line ${i + 1} has an invalid format. Expected: "address amount"`);
                hasInvalidLine = true;
                break;
            }

            const [address, amountStr] = parts;
            const valid = isAddress(address);

            // Check if amount is a valid number
            const amount = amountStr.replace(',', '.');
            if (Number.isNaN(Number(amount)) || Number(amount) <= 0) {
                setError(`Line ${i + 1} has an invalid amount. Amount must be a positive number.`);
                hasInvalidLine = true;
                break;
            }

            parsedRecipients.push({ address, amount, valid });
        }

        if (!hasInvalidLine) {
            setRecipients(parsedRecipients);
            onRecipientsChange(parsedRecipients);
        }

        setProcessingText(false);
    }, [textareaValue, processingText, onRecipientsChange]);

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setTextareaValue(e.target.value);
        setProcessingText(true);
    };

    const getTotalAmount = (): string => {
        return recipients
            .reduce((sum, recipient) => {
                return sum + (Number(recipient.amount) || 0);
            }, 0)
            .toString();
    };

    return (
        <div className="mb-6">
            <label htmlFor="recipients" className="block text-gray-700 text-sm font-medium mb-2">
                Recipients and Amounts
            </label>
            <div className="mb-2 text-sm text-gray-600">
                Enter one address and amount per line. Separate address and amount with a space, comma, or tab.
            </div>
            <div className="mb-4">
                <textarea
                    id="recipients"
                    value={textareaValue}
                    onChange={handleTextareaChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 h-40 font-mono text-sm"
                    placeholder="0x1234... 1.5&#10;0x5678... 2.25&#10;0x9abc... 0.5"
                />
                {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <span className="text-gray-600">Recipients:</span>
                    <span className="ml-1 font-medium">{recipients.length}</span>
                </div>
                <div>
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="ml-1 font-medium">{getTotalAmount()}</span>
                </div>
            </div>

            {recipients.length > 0 && (
                <div className="mt-4 border rounded-md overflow-hidden">
                    <div className="bg-gray-50 p-2 text-xs font-medium text-gray-700 border-b grid grid-cols-3">
                        <div>Recipient</div>
                        <div>Amount</div>
                        <div>Status</div>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                        {recipients.map((recipient, index) => (
                            <div
                                key={`recipient-${recipient.address}-${index}`}
                                className="p-2 text-xs border-b last:border-b-0 grid grid-cols-3"
                            >
                                <div className="font-mono truncate">{recipient.address}</div>
                                <div>{recipient.amount}</div>
                                <div>
                                    {recipient.valid
                                        ? <span className="text-green-600">✓ Valid</span>
                                        : <span className="text-red-500">Invalid address</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
} 