"use client";

import { useRef, useState } from "react";
import { Editor, OnMount } from "@monaco-editor/react";

interface CodeSectionProps {
    text: string;
}

const CodeSection = ({ text }: CodeSectionProps) => {
    const editorRef = useRef<any>(null);
    const [editorHeight, setEditorHeight] = useState(96); // Default height

    const handleEditorMount: OnMount = (editor) => {
        editorRef.current = editor;

        // Adjust editor height dynamically
        const updateHeight = () => {
            const contentHeight = editor.getContentHeight();
            setEditorHeight(contentHeight);
        };

        // Initial height adjustment
        updateHeight();

        // Listen for content changes and resize
        editor.onDidContentSizeChange(updateHeight);
    };

    return (
        <div className="mt-4 rounded-lg overflow-hidden w-full">
            <div style={{ height: `${editorHeight}px` }}>
                <Editor
                    defaultLanguage="javascript"
                    value={text}
                    theme="vs-dark"
                    options={{
                        fontSize: 14,
                        minimap: { enabled: false },
                        contextmenu: false,
                        readOnly: true,
                        scrollBeyondLastLine: false,
                        wordWrap: "on", 
                        wrappingIndent: "indent",
                        padding: {bottom: 20, top: 20}
                    }}
                    onMount={handleEditorMount}
                />
            </div>
        </div>
    );
};

export default CodeSection;