import React, { useState, useRef, useEffect } from 'react';

import { Upload, ArrowDown, Download, ImagePlus } from 'lucide-react';
import { Button } from './button';
import { Label } from './label';
import { Input } from './input';
import { Textarea } from './textarea';


const TextOnImageEditor = () => {
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [text1, setText1] = useState('');
    const [text2, setText2] = useState('');
    const [text3, setText3] = useState('');
    const [processedImage, setProcessedImage] = useState(null);
    const canvasRef = useRef(null);
    const [customFontsLoaded, setCustomFontsLoaded] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const loadCustomFonts = async () => {
            // Load custom web fonts using Google Fonts
            const fontLink = document.createElement('link');
            fontLink.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Myanmar:wght@100;200;300;400;500;600;700;800;900&display=swap';
            fontLink.rel = 'stylesheet';

            document.head.appendChild(fontLink);

            // Wait for fonts to load
            await document.fonts.ready;
            setCustomFontsLoaded(true);
        };

        loadCustomFonts();
    },);
    // Handle image upload
    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);

            const reader = new FileReader();
            reader.onload = (event) => {
                setImagePreview(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };
    const renderMultilineText = (ctx, textRaw, x, y, maxWidth, lineHeight) => {

        let text = textRaw.replaceAll('\n', ' ');
        const words = text.split(' ');

        let line = '';
        let lines = [];


        // Break text into lines based on maxWidth
        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;

            if (testWidth > maxWidth && i > 0) {
                lines.push(line.trim());
                line = words[i] + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line.trim());

        // Calculate total height needed for all lines
        const totalHeight = lines.length * lineHeight;

        // Adjust y position for bottom alignment if needed (for text3)
        const startY = y - totalHeight / 2;

        // Render each line
        for (let i = 0; i < lines.length; i++) {
            const curY = startY + (i * lineHeight);

            ctx.fillText(lines[i], x, curY);
        }
    };
    const processImage = () => {
        if (!image) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {

            // Set canvas dimensions to match image
            canvas.width = img.width;
            canvas.height = img.height;
            let dateX = img.width - 240;
            let dateY = img.height / 4.6;
            let toX = img.width / 4.5;
            let toY = img.height / 3.76;
            let fromX = img.width / 4.5;
            let fromY = img.height / 2.9;
            let descX = img.width / 4.5;
            let descY = img.height / 1.92;
            // Draw image
            ctx.drawImage(img, 0, 0);

            // Calculate font size based on image dimensions
            const fontSize = 20;
            ctx.font = `500 ${fontSize}px "Noto Sans Myanmar"`;
            ctx.fillStyle = 'black';


            ctx.textAlign = 'left';
            const currentDate = new Date();
            const formattedDate = currentDate.toLocaleDateString('en-US', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });
            ctx.textBaseline = 'top';
            ctx.fillText(formattedDate, dateX, dateY);
            // Add text at top
            if (text1) {
                ctx.textBaseline = 'top';
                ctx.fillText(text1, toX, toY);
            }

            // Add text in middle
            if (text2) {
                ctx.textBaseline = 'middle';

                ctx.fillText(text2, fromX, fromY);
            }

            // Add text at bottom
            if (text3) {
                ctx.textBaseline = 'bottom';
                renderMultilineText(ctx, text3, descX, descY, 450, 35)
                // ctx.fillText(text3, descX, img.height - fontSize);
            }

            // Set processed image
            setProcessedImage(canvas.toDataURL('image/png'));
        };

        img.src = imagePreview;
    };

    const downloadImage = () => {
        if (!processedImage) return;

        const link = document.createElement('a');
        link.download = `${text1}.png`;
        link.href = processedImage;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleClickUpload = () => {
        fileInputRef.current.click();
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold mb-6">Text on Image Editor</h1>

            <div className="flex flex-col space-y-4">
                {/* File upload section */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                        className="hidden"
                    />
                    {!imagePreview ? (
                        <>
                            <ImagePlus className="w-12 h-48 text-gray-400 mb-2" />
                            <p className="text-gray-500 mb-2">Upload an image to get started</p>
                            <Button
                                onClick={handleClickUpload}
                                className="flex items-center gap-2"
                            >
                                <Upload className="w-4 h-4" />
                                Select Image
                            </Button>
                        </>
                    ) : (
                        <div className="relative w-full ">
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full h-full max-h-[400px] rounded-lg object-contain"
                            />
                            <Button
                                onClick={handleClickUpload}
                                variant="outline"
                                size="sm"
                                className="absolute top-2 right-2 bg-white/80"
                            >
                                Change Image
                            </Button>
                        </div>
                    )}
                </div>

                {/* Text input section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    <div>
                        <Label htmlFor="text1">To</Label>
                        <Input
                            id="text1"
                            placeholder="Name"
                            value={text1}
                            onChange={(e) => setText1(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="text2">From</Label>
                        <Input
                            id="text2"
                            placeholder="Name"
                            value={text2}
                            onChange={(e) => setText2(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="text3">စကားလက်ဆောင်</Label>
                        <Textarea
                            id="text3"
                            placeholder="Text at the bottom (supports multiple lines)"
                            value={text3}
                            onChange={(e) => setText3(e.target.value)}
                            className="custom-font min-h-24"
                            rows={4}
                        />
                    </div>

                </div>

                {/* Process button */}
                <Button
                    onClick={processImage}
                    disabled={!imagePreview && customFontsLoaded}
                    className="flex items-center gap-2 mx-auto"
                >
                    Process Image <ArrowDown className="w-4 h-4" />
                </Button>

                {/* Preview section */}
                {processedImage && (
                    <div className="border rounded-lg p-4 space-y-4">
                        <h2 className="text-lg font-semibold">Preview</h2>
                        <div className="flex justify-center  ">
                            <img
                                src={processedImage}
                                alt="Processed"
                                className="max-w-full max-h-128 object-contain rounded-lg"
                            />
                        </div>
                        <Button
                            onClick={downloadImage}
                            className="flex items-center gap-2 mx-auto"
                        >
                            <Download className="w-4 h-4" />
                            Download Image
                        </Button>
                    </div>
                )}
            </div>

            {/* Hidden canvas for image processing */}
            <canvas ref={canvasRef} className="hidden"></canvas>
        </div>
    );
};

export default TextOnImageEditor;