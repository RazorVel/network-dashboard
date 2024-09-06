import { AppContext } from "../context.js";
import React, { useContext, useState } from "react";
import classNames from "classnames";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism/index.js";
import "github-markdown-css";
import "../overrides/custom-light-theme-github-md.css";

const Documentation = ({ className, ...props }) => {
    const { documentation } = useContext(AppContext);
    const [copiedStates, setCopiedStates] = useState({});

    const handleCopy = (index) => {
        setCopiedStates((prev) => ({ ...prev, [index]: true }));
        setTimeout(() => {
            setCopiedStates((prev) => ({ ...prev, [index]: false }));
        }, 2000); // Reset copied state after 2 seconds
    };

    // Function to generate an ID from a heading's text
    const generateId = (text) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

    return (
        <div className={classNames("p-4 w-full", className)} style={{width: "calc(100% - 90px)"}} {...props}>
            <Markdown
                className="markdown-body"
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                    h1: ({ node, children, ...props }) => {
                        const id = generateId(children);
                        return <h1 id={id} {...props}>{children}</h1>;
                    },
                    h2: ({ node, children, ...props }) => {
                        const id = generateId(children);
                        return <h2 id={id} {...props}>{children}</h2>;
                    },
                    h3: ({ node, children, ...props }) => {
                        const id = generateId(children);
                        return <h3 id={id} {...props}>{children}</h3>;
                    },
                    h4: ({ node, children, ...props }) => {
                        const id = generateId(children);
                        return <h4 id={id} {...props}>{children}</h4>;
                    },
                    h5: ({ node, children, ...props }) => {
                        const id = generateId(children);
                        return <h5 id={id} {...props}>{children}</h5>;
                    },
                    h6: ({ node, children, ...props }) => {
                        const id = generateId(children);
                        return <h6 id={id} {...props}>{children}</h6>;
                    },
                    code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        const codeIndex = node.position?.start.offset; // Unique key based on position

                        return !inline && match ? (
                            <div className="relative">
                                <CopyToClipboard text={String(children).replace(/\n$/, '')} onCopy={() => handleCopy(codeIndex)}>
                                    <button className="absolute right-2 top-2 text-gray-200 border border-4 px-2 py-1 rounded z-10">
                                        {copiedStates[codeIndex] ? "Copied!" : "Copy"}
                                    </button>
                                </CopyToClipboard>
                                <SyntaxHighlighter
                                    style={materialDark}
                                    language={match[1]}
                                    PreTag="div"
                                    customStyle={{ paddingRight: "5rem" }}
                                    {...props}
                                >
                                    {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                            </div>
                        ) : (
                            <code className={className} {...props}>
                                {children}
                            </code>
                        );
                    },
                }}
            >
                {documentation}
            </Markdown>
        </div>
    );
};

export default Documentation;
