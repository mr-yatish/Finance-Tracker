"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BrainCircuit, Send, User } from "lucide-react"

export default function AIChatPage() {
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([
        { role: 'ai', content: "Hello! I'm your AI financial assistant. Ask me anything about your spending or budget." }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMsg = inputValue;
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInputValue("");
        setIsLoading(true);

        // Mock AI response for now
        setTimeout(() => {
            let aiResponse = "I can help with that. Could you provide more details?";
            if (userMsg.toLowerCase().includes("spend") || userMsg.toLowerCase().includes("cost")) {
                aiResponse = "Based on your recent transactions, your spending on food has increased by 15% this month compared to last month.";
            } else if (userMsg.toLowerCase().includes("save") || userMsg.toLowerCase().includes("budget")) {
                aiResponse = "To save more, consider reducing your entertainment expenses, which account for 20% of your outflow.";
            } else if (userMsg.toLowerCase().includes("hello") || userMsg.toLowerCase().includes("hi")) {
                aiResponse = "Hi there! Ready to optimize your finances today?";
            }

            setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
            <h1 className="text-3xl font-bold tracking-tight">AI Financial Assistant</h1>

            <Card className="flex-1 flex flex-col rounded-3xl border-none shadow-md bg-card overflow-hidden">
                <CardHeader className="bg-primary/5 border-b">
                    <CardTitle className="flex items-center gap-2 text-primary">
                        <BrainCircuit className="h-6 w-6" />
                        FinBot
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`
                                max-w-[80%] rounded-2xl px-4 py-3 text-sm
                                ${m.role === 'user'
                                    ? 'bg-primary text-primary-foreground rounded-br-none'
                                    : 'bg-muted text-foreground rounded-bl-none'}
                            `}>
                                {m.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-muted px-4 py-3 rounded-2xl rounded-bl-none flex gap-1">
                                <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </CardContent>
                <div className="p-4 bg-background border-t">
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        className="flex gap-2"
                    >
                        <Input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Ask about your finances..."
                            className="rounded-full shadow-sm"
                            disabled={isLoading}
                        />
                        <Button type="submit" size="icon" className="rounded-full shrink-0" disabled={isLoading || !inputValue.trim()}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    );
}
