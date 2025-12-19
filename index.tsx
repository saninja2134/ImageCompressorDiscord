/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";
import { UploadHandler, React } from "@webpack/common";
import { ImageIcon } from "@components/Icons";
import { ChatBarButton } from "@api/ChatButtons";

const MAX_SIZE = 10 * 1000 * 1000; // 10MB (slightly under to be safe)

async function compressImage(file: File): Promise<File> {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    try {
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = url;
        });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return file;

        // Increase max dimension to 8K to preserve more detail
        let width = img.width;
        let height = img.height;
        const MAX_DIMENSION = 7680; 

        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
            width *= ratio;
            height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Binary Search for the perfect quality
        let minQuality = 0.3;
        let maxQuality = 1.0;
        let bestBlob: Blob | null = null;
        let finalQuality = 1.0;

        // We'll try 7 iterations of binary search to get very precise quality
        for (let i = 0; i < 7; i++) {
            const midQuality = (minQuality + maxQuality) / 2;
            const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/jpeg", midQuality));
            
            if (blob && blob.size <= MAX_SIZE) {
                bestBlob = blob;
                finalQuality = midQuality;
                minQuality = midQuality; // Try to go even higher
            } else {
                maxQuality = midQuality; // Too big, must go lower
            }
        }

        // If even at 0.3 quality it's too big, we start downscaling
        if (!bestBlob) {
            let scale = 0.9;
            while (scale > 0.1) {
                const sWidth = width * scale;
                const sHeight = height * scale;
                canvas.width = sWidth;
                canvas.height = sHeight;
                ctx.drawImage(img, 0, 0, sWidth, sHeight);
                
                const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/jpeg", 0.7));
                if (blob && blob.size <= MAX_SIZE) {
                    bestBlob = blob;
                    width = sWidth;
                    height = sHeight;
                    finalQuality = 0.7;
                    break;
                }
                scale -= 0.1;
            }
        }

        if (bestBlob && bestBlob.size < file.size) {
            console.log(`[ImageCompressor] Optimized ${file.name}: ${(bestBlob.size / 1024 / 1024).toFixed(2)}MB (Quality: ${finalQuality.toFixed(3)}, Res: ${Math.round(width)}x${Math.round(height)})`);
            return new File([bestBlob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: "image/jpeg" });
        }
    } catch (e) {
        console.error("[ImageCompressor] Failed to compress image", e);
    } finally {
        URL.revokeObjectURL(url);
    }
    return file;
}

export default definePlugin({
    name: "ImageCompressor",
    description: "Compresses images over 10MB before uploading to bypass Discord's size limit.",
    authors: [Devs.User],

    chatBarButton: {
        icon: ImageIcon,
        render: (props) => {
            return (
                <ChatBarButton
                    tooltip="Upload Compressed Image"
                    onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "image/*";
                        input.onchange = async () => {
                            const file = input.files?.[0];
                            if (!file) return;
                            
                            const compressed = await compressImage(file);
                            UploadHandler.promptToUpload([compressed], props.channel, 0);
                        };
                        input.click();
                    }}
                >
                    <ImageIcon />
                </ChatBarButton>
            );
        }
    },

    start() {
        console.log("[ImageCompressor] Plugin started");
    }
});
