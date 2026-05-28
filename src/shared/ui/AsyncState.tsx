type AsyncStateProps = {
  message: string;
};

export function LoadingState({ message }: AsyncStateProps) {
  return <div className="state-panel">{message}</div>;
}

export function ErrorState({ message }: AsyncStateProps) {
  return <div className="state-panel error">{message}</div>;
}

export function EmptyState({ message }: AsyncStateProps) {
  return <div className="state-panel empty">{message}</div>;
}
