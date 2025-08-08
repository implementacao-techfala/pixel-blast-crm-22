import { memo, useMemo } from 'react';

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight?: number;
  containerHeight?: number;
  className?: string;
}

function VirtualizedListComponent<T>({
  items,
  renderItem,
  itemHeight = 100,
  containerHeight = 400,
  className = ''
}: VirtualizedListProps<T>) {
  const memoizedItems = useMemo(() => items, [items]);

  return (
    <div className={`overflow-auto ${className}`} style={{ height: containerHeight }}>
      {memoizedItems.map((item, index) => (
        <div key={index} style={{ height: itemHeight }}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}

export const VirtualizedList = memo(VirtualizedListComponent) as typeof VirtualizedListComponent;