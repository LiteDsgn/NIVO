
import http from 'http';

const variations = [
    // Variation 1: Vertical Card (Standard)
    {
        type: "FRAME",
        name: "Trainest - Vertical",
        layoutMode: "VERTICAL",
        width: 320,
        height: 420,
        cornerRadius: 12,
        fills: [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }],
        itemSpacing: 0,
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
        children: [
            {
                type: "RECTANGLE",
                name: "Hero Image",
                width: 320,
                height: 180,
                image: "fitness",
                layoutSizingHorizontal: "FILL",
                layoutSizingVertical: "FIXED"
            },
            {
                type: "FRAME",
                name: "Content",
                layoutMode: "VERTICAL",
                itemSpacing: 12,
                padding: { top: 16, right: 16, bottom: 16, left: 16 },
                layoutSizingHorizontal: "FILL",
                layoutSizingVertical: "HUG",
                children: [
                    {
                        type: "FRAME",
                        name: "Badge",
                        layoutMode: "HORIZONTAL",
                        padding: { top: 4, right: 8, bottom: 4, left: 8 },
                        fills: [{ type: "SOLID", color: { r: 0.9, g: 0.95, b: 1 } }],
                        cornerRadius: 4,
                        children: [
                            { type: "TEXT", characters: "PREMIUM", fontSize: 10, fontWeight: "Bold", fills: [{ type: "SOLID", color: { r: 0, g: 0.4, b: 0.8 } }] }
                        ]
                    },
                    {
                        type: "TEXT",
                        name: "Title",
                        characters: "High Conversion Training",
                        fontSize: 18,
                        fontWeight: "Bold",
                        layoutSizingHorizontal: "FILL"
                    },
                    {
                        type: "TEXT",
                        name: "Description",
                        characters: "Master your fitness journey with our premium training program designed for maximum results.",
                        fontSize: 14,
                        fills: [{ type: "SOLID", color: { r: 0.4, g: 0.4, b: 0.4 } }],
                        layoutSizingHorizontal: "FILL"
                    },
                    {
                        type: "FRAME",
                        name: "Button",
                        layoutMode: "HORIZONTAL",
                        primaryAxisAlignItems: "CENTER",
                        counterAxisAlignItems: "CENTER",
                        height: 40,
                        layoutSizingHorizontal: "FILL",
                        fills: [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }],
                        cornerRadius: 8,
                        children: [
                            { type: "TEXT", characters: "Start Training", fontSize: 14, fontWeight: "SemiBold", fills: [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }] }
                        ]
                    }
                ]
            }
        ]
    },
    // Variation 2: Horizontal Card (List Item)
    {
        type: "FRAME",
        name: "Trainest - Horizontal",
        layoutMode: "HORIZONTAL",
        width: 480,
        height: 160,
        cornerRadius: 12,
        fills: [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }],
        itemSpacing: 0,
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
        children: [
            {
                type: "RECTANGLE",
                name: "Image",
                width: 160,
                height: 160,
                image: "fitness-side",
                layoutSizingVertical: "FILL",
                layoutSizingHorizontal: "FIXED"
            },
            {
                type: "FRAME",
                name: "Content",
                layoutMode: "VERTICAL",
                itemSpacing: 8,
                padding: { top: 16, right: 16, bottom: 16, left: 16 },
                layoutSizingHorizontal: "FILL",
                layoutSizingVertical: "FILL",
                primaryAxisAlignItems: "CENTER",
                children: [
                    {
                        type: "FRAME",
                        layoutMode: "HORIZONTAL",
                        primaryAxisAlignItems: "SPACE_BETWEEN",
                        layoutSizingHorizontal: "FILL",
                        children: [
                            { type: "TEXT", characters: "PREMIUM", fontSize: 10, fontWeight: "Bold", fills: [{ type: "SOLID", color: { r: 0, g: 0.4, b: 0.8 } }] },
                            { type: "TEXT", characters: "4.9 ★", fontSize: 12, fontWeight: "Medium" }
                        ]
                    },
                    {
                        type: "TEXT",
                        characters: "High Conversion Training",
                        fontSize: 16,
                        fontWeight: "Bold",
                        layoutSizingHorizontal: "FILL"
                    },
                    {
                        type: "TEXT",
                        characters: "Get access to exclusive workouts.",
                        fontSize: 12,
                        fills: [{ type: "SOLID", color: { r: 0.5, g: 0.5, b: 0.5 } }],
                        layoutSizingHorizontal: "FILL"
                    },
                    {
                        type: "FRAME",
                        name: "Button",
                        layoutMode: "HORIZONTAL",
                        primaryAxisAlignItems: "CENTER",
                        counterAxisAlignItems: "CENTER",
                        height: 32,
                        layoutSizingHorizontal: "FILL", // Or HUG
                        fills: [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }],
                        cornerRadius: 6,
                        marginTop: 8,
                        children: [
                            { type: "TEXT", characters: "View Details", fontSize: 12, fontWeight: "Medium", fills: [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }] }
                        ]
                    }
                ]
            }
        ]
    },
    // Variation 3: Overlay Card (Modern)
    {
        type: "FRAME",
        name: "Trainest - Overlay",
        layoutMode: "VERTICAL",
        width: 300,
        height: 400,
        cornerRadius: 16,
        fills: [{ type: "SOLID", color: { r: 0.1, g: 0.1, b: 0.1 } }], // Fallback color
        itemSpacing: 0,
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
        children: [
            // Background Image simulated as absolute position or full fill
            // Since we can't easily do absolute positioning in this simplified schema for children of Auto Layout without tricks,
            // we'll make the frame have an image fill or use a big image.
            // Let's use a Frame with Image Fill.
            {
                type: "FRAME",
                name: "ImageContainer",
                layoutMode: "VERTICAL",
                layoutSizingHorizontal: "FILL",
                layoutSizingVertical: "FILL",
                fills: [{ type: "IMAGE", scaleMode: "FILL", imageHash: "mock_image_hash" }], // We can't put real image hash easily
                // So let's use a solid color for now as placeholder for image
                // fills: [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.3 } }],
                primaryAxisAlignItems: "MAX", // Bottom align content
                padding: { top: 20, right: 20, bottom: 20, left: 20 },
                children: [
                    {
                        type: "FRAME",
                        name: "OverlayContent",
                        layoutMode: "VERTICAL",
                        itemSpacing: 8,
                        layoutSizingHorizontal: "FILL",
                        // We can't add blur effect easily via this schema unless we support effects
                        // So just text over dark bg
                        children: [
                            {
                                type: "TEXT",
                                characters: "PREMIUM PLAN",
                                fontSize: 12,
                                fontWeight: "Bold",
                                fills: [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }]
                            },
                            {
                                type: "TEXT",
                                characters: "High Conversion",
                                fontSize: 24,
                                fontWeight: "ExtraBold",
                                fills: [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }]
                            },
                            {
                                type: "TEXT",
                                characters: "$29/mo",
                                fontSize: 16,
                                fontWeight: "Medium",
                                fills: [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }]
                            },
                            {
                                type: "FRAME",
                                name: "Button",
                                layoutMode: "HORIZONTAL",
                                primaryAxisAlignItems: "CENTER",
                                counterAxisAlignItems: "CENTER",
                                height: 44,
                                layoutSizingHorizontal: "FILL",
                                fills: [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }],
                                cornerRadius: 22,
                                marginTop: 16,
                                children: [
                                    { type: "TEXT", characters: "Get Started", fontSize: 14, fontWeight: "Bold", fills: [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }] }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }
];

function sendVariation(variation, index) {
    return new Promise((resolve, reject) => {
        console.log(`Sending variation ${index + 1}...`);
        const data = JSON.stringify(variation);

        const options = {
            hostname: 'localhost',
            port: 9600,
            path: '/generate',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log(`Variation ${index + 1} created.`);
                    resolve(JSON.parse(body));
                } else {
                    console.error(`Variation ${index + 1} failed: ${body}`);
                    reject(new Error(body));
                }
            });
        });

        req.on('error', (e) => {
            console.error(`Request error: ${e.message}`);
            reject(e);
        });

        req.write(data);
        req.end();
    });
}

async function run() {
    for (let i = 0; i < variations.length; i++) {
        try {
            await sendVariation(variations[i], i);
            // Wait a bit between creations
            await new Promise(r => setTimeout(r, 1000));
        } catch (e) {
            console.error(`Stopped at variation ${i + 1}`);
            break;
        }
    }
}

run();
