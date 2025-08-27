function BotCommand({ command, description }) {


  const slashAndCommand = '/' + command
  return (
    <li><code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{slashAndCommand}</code> - {description}</li>
  )
}

export default BotCommand