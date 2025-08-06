function FeatureBox({ icon, title, children }) {
  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
      <h3 className="text-xl font-semibold mb-3">{icon} {title}</h3>
      {children}
    </div>
  )
}

export default FeatureBox