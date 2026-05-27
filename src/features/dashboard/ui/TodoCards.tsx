const todos = [
  '처리할 결석 신청 3건',
  '회차 소진 임박 5명',
  '위험 수강생 4명',
];

export function TodoCards() {
  return (
    <article className="panel">
      <h2>To-do</h2>
      <ul className="todo-list">
        {todos.map((todo) => (
          <li key={todo}>{todo}</li>
        ))}
      </ul>
    </article>
  );
}
