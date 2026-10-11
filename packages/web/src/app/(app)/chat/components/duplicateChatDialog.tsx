'use client';

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTranslations } from "@/i18n/I18nProvider";

interface DuplicateChatDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onDuplicate: (name: string) => Promise<string | null>;
    currentName: string;
}

export const DuplicateChatDialog = ({ isOpen, onOpenChange, onDuplicate, currentName }: DuplicateChatDialogProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const t = useTranslations("chat");
    const tCommon = useTranslations("common");

    const formSchema = z.object({
        name: z.string().min(1),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
        },
    });

    useEffect(() => {
        form.reset({
            name: `${currentName} (copy)`,
        });
    }, [currentName, form]);

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        try {
            const newChatId = await onDuplicate(data.name);
            if (newChatId) {
                form.reset();
                onOpenChange(false);
            }
        } catch (e) {
            console.error('Failed to duplicate chat', e);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!isLoading) {
                    onOpenChange(open);
                }
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("duplicateChatTitle")}</DialogTitle>
                    <DialogDescription>
                        {t("duplicateChatDescription")}
                    </DialogDescription>
                </DialogHeader>
                <Form
                    {...form}
                >
                    <form
                        className="space-y-4 flex flex-col w-full py-2"
                        onSubmit={(event) => {
                            event.stopPropagation();
                            form.handleSubmit(onSubmit)(event);
                        }}
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem
                                    className="flex flex-col gap-2"
                                >
                                    <FormLabel className="font-normal">{t("newChatName")}</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder={t("enterChatName")}
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
                <DialogFooter>
                    <Button
                        variant="outline"
                        disabled={isLoading}
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpenChange(false);
                        }}
                    >
                        {tCommon("cancel")}
                    </Button>
                    <LoadingButton
                        loading={isLoading}
                        onClick={() => {
                            form.handleSubmit(onSubmit)();
                        }}
                    >
                        {t("duplicate")}
                    </LoadingButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
