export default function EmptyState({ icon = '📭', title, description, action }) {
  return (
    <div className="card-ancient p-8 text-center">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'var(--font-serif)', color: 'var(--clr-ink)' }}>
        {title}
      </h3>
      {description && (
        <p className="text-sm mb-6" style={{ color: 'var(--clr-ink-soft)', fontFamily: 'var(--font-serif)' }}>
          {description}
        </p>
      )}
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  )
}
