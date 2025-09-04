"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  return (
    <div className={`prose prose-slate max-w-none prose-headings:text-text-primary prose-p:text-text-secondary prose-strong:text-text-primary prose-blockquote:border-l-primary-main prose-blockquote:bg-primary-pale prose-a:text-primary-main hover:prose-a:text-primary-dark ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // 제목 스타일링
          h1: ({ children, ...props }) => (
            <h1 className="text-3xl font-bold text-text-primary mb-6 pb-3 border-b-2 border-primary-main bg-gradient-to-r from-primary-main to-primary-dark bg-clip-text text-transparent" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className="text-2xl font-semibold text-text-primary mb-4 mt-8 pb-2 border-b border-primary-light flex items-center gap-2" {...props}>
              <div className="w-2 h-6 bg-gradient-to-b from-primary-main to-primary-dark rounded-full"></div>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="text-xl font-semibold text-text-primary mb-3 mt-6 flex items-center gap-2" {...props}>
              <div className="w-1.5 h-5 bg-primary-main rounded-full"></div>
              {children}
            </h3>
          ),
          h4: ({ children, ...props }) => (
            <h4 className="text-base font-medium text-gray-700 mb-2 mt-4" {...props}>
              {children}
            </h4>
          ),
          h5: ({ children, ...props }) => (
            <h5 className="text-sm font-medium text-gray-700 mb-1 mt-3" {...props}>
              {children}
            </h5>
          ),
          h6: ({ children, ...props }) => (
            <h6 className="text-sm font-medium text-gray-600 mb-1 mt-3" {...props}>
              {children}
            </h6>
          ),

          // 단락 스타일링
          p: ({ children, ...props }) => (
            <p className="text-text-secondary leading-relaxed mb-4 text-sm" {...props}>
              {children}
            </p>
          ),

          // 강조 텍스트
          strong: ({ children, ...props }) => (
            <strong className="font-bold text-text-primary bg-gradient-to-r from-primary-main to-primary-dark bg-clip-text text-transparent" {...props}>
              {children}
            </strong>
          ),
          em: ({ children, ...props }) => (
            <em className="italic text-text-secondary font-medium" {...props}>
              {children}
            </em>
          ),

          // 목록 스타일링
          ul: ({ children, ...props }) => (
            <ul className="mb-4 space-y-1.5 pl-5" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="mb-4 space-y-1.5 pl-5" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className="text-text-secondary leading-relaxed relative flex items-start gap-2.5" {...props}>
              <div className="w-1.5 h-1.5 bg-primary-main rounded-full mt-2.5 flex-shrink-0"></div>
              <span className="flex-1">{children}</span>
            </li>
          ),

          // 코드 블록
          code: ({ inline, className, children, ...props }: any) => {
            if (inline) {
              return (
                <code 
                  className="bg-gray-50 text-gray-700 px-1.5 py-0.5 rounded font-mono text-xs font-medium" 
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code 
                className={`inline-block bg-gray-50 text-gray-700 px-2 py-1 rounded font-mono text-sm font-medium ${className || ''}`}
                {...props}
              >
                {children}
              </code>
            );
          },

          // 사전 형식 텍스트
          pre: ({ children, ...props }) => (
            <pre className="bg-gray-50 text-gray-800 p-0 rounded-md overflow-x-auto mb-4 border border-gray-200" {...props}>
              {children}
            </pre>
          ),

          // 인용구
          blockquote: ({ children, ...props }) => (
            <blockquote className="border-l-4 border-primary-main bg-primary-pale pl-6 py-4 my-6 rounded-r-lg shadow-sm" {...props}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary-main rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                  </svg>
                </div>
                <div className="italic text-text-secondary leading-relaxed">{children}</div>
              </div>
            </blockquote>
          ),

          // 테이블
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto mb-6 rounded-lg shadow-sm border border-gray-200">
              <table className="min-w-full" {...props}>
                {children}
              </table>
            </div>
          ),
          thead: ({ children, ...props }) => (
            <thead className="bg-gradient-to-r from-primary-pale to-white" {...props}>
              {children}
            </thead>
          ),
          tbody: ({ children, ...props }) => (
            <tbody className="divide-y divide-gray-100 bg-white" {...props}>
              {children}
            </tbody>
          ),
          tr: ({ children, ...props }) => (
            <tr className="hover:bg-gray-50 transition-colors" {...props}>
              {children}
            </tr>
          ),
          th: ({ children, ...props }) => (
            <th className="px-6 py-3 text-left text-sm font-semibold text-text-primary border-b border-primary-light" {...props}>
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td className="px-6 py-3 text-sm text-text-secondary border-b border-gray-100" {...props}>
              {children}
            </td>
          ),

          // 링크
          a: ({ children, href, ...props }) => (
            <a 
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-main hover:text-primary-dark underline transition-colors"
              {...props}
            >
              {children}
            </a>
          ),

          // 구분선
          hr: ({ ...props }) => (
            <hr className="my-6 border-gray-300" {...props} />
          ),

          // 이미지
          img: ({ src, alt, ...props }) => (
            <img 
              src={src} 
              alt={alt}
              className="max-w-full h-auto rounded-lg shadow-sm mb-4"
              {...props}
            />
          ),

          // 취소선
          del: ({ children, ...props }) => (
            <del className="line-through text-gray-500" {...props}>
              {children}
            </del>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
