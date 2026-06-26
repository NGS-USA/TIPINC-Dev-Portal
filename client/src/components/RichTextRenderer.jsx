export default function RichTextRenderer({ html, style = {} }) {
  if (!html) return null
  return (
    <div
      dangerouslySetInnerHTML={{ __html: html }}
      style={{
        fontSize: '13px',
        color: '#374151',
        lineHeight: '1.6',
        ...style
      }}
    />
  )
}