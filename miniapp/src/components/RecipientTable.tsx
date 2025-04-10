import { useState, useEffect } from "react";
import { parseUnits } from "viem";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/input";

interface Recipient {
    id: string; // Add unique ID for keys
    address: string;
    amount: bigint;
    amountStr: string; // Store the string value for display
}

interface RecipientTableProps {
    onChange: (recipients: { address: string; amount: bigint }[]) => void;
    onError: (error: string | null) => void;
    onAmountSum: (sum: bigint) => void;
}

export default function RecipientTable({ onChange, onError, onAmountSum }: RecipientTableProps) {
    const [recipients, setRecipients] = useState<Recipient[]>([
        { id: crypto.randomUUID(), address: "", amount: 0n, amountStr: "" },
    ]);
    const [canAddRow, setCanAddRow] = useState(false);

    useEffect(() => {
        // Check if the last row is complete to enable the add button
        const lastRecipient = recipients[recipients.length - 1];
        setCanAddRow(
            lastRecipient.address.startsWith("0x") &&
            lastRecipient.address.length === 42 &&
            lastRecipient.amountStr !== ""
        );

        // Only validate and propagate non-empty entries
        const validRecipients = recipients.filter(
            (r) => r.address && r.amountStr && r.amount > 0n
        );

        try {
            // Validate all recipients
            for (const recipient of validRecipients) {
                if (!recipient.address.startsWith("0x") || recipient.address.length !== 42) {
                    throw new Error(`Invalid Ethereum address: ${recipient.address}`);
                }
            }

            // Calculate sum
            const sum = validRecipients.reduce((acc, { amount }) => acc + amount, 0n);

            // Propagate changes to parent
            onChange(validRecipients.map(({ address, amount }) => ({ address, amount })));
            onAmountSum(sum);
            onError(null);
        } catch (err) {
            onError((err as Error).message);
        }
    }, [recipients, onChange, onError, onAmountSum]);

    const updateRecipient = (id: string, field: "address" | "amountStr", value: string) => {
        const newRecipients = recipients.map(r =>
            r.id === id ? { ...r, [field]: value } : r
        );

        // If updating amount, convert to bigint
        if (field === "amountStr") {
            const recipientIndex = newRecipients.findIndex(r => r.id === id);
            if (recipientIndex !== -1 && value) {
                try {
                    newRecipients[recipientIndex].amount = parseUnits(value, 18);
                } catch (err) {
                    // Invalid amount format, but keep the string value
                    newRecipients[recipientIndex].amount = 0n;
                }
            }
        }

        setRecipients(newRecipients);
    };

    const addRow = () => {
        setRecipients([...recipients, { id: crypto.randomUUID(), address: "", amount: 0n, amountStr: "" }]);
    };

    const removeRow = (id: string) => {
        if (recipients.length > 1) {
            setRecipients(recipients.filter(r => r.id !== id));
        }
    };

    return (
        <div className="w-full">
            <div className="grid grid-cols-[1fr_1fr_40px] gap-2 mb-2 font-medium">
                <div>Address</div>
                <div>Amount</div>
                <div />
            </div>

            {recipients.map((recipient) => (
                <div key={recipient.id} className="grid grid-cols-[1fr_1fr_40px] gap-2 mb-2">
                    <Input
                        type="text"
                        placeholder="0x..."
                        value={recipient.address}
                        onChange={(e) => updateRecipient(recipient.id, "address", e.target.value)}
                        className="text-sm"
                    />
                    <Input
                        type="text"
                        placeholder="1.5"
                        value={recipient.amountStr}
                        onChange={(e) => updateRecipient(recipient.id, "amountStr", e.target.value)}
                        className="text-sm"
                    />
                    {recipients.length > 1 && (
                        <Button
                            onClick={() => removeRow(recipient.id)}
                            className="p-0 w-8 h-8 text-red-500"
                        >
                            ✕
                        </Button>
                    )}
                </div>
            ))}

            {canAddRow && (
                <Button
                    onClick={addRow}
                    className="mt-2 text-sm"
                >
                    + Add Recipient
                </Button>
            )}
        </div>
    );
} 