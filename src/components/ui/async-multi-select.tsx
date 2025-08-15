import React, { useState, useRef, useEffect } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronsUpDown, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AsyncMultiSelectOption {
  value: string;
  label: string;
  description?: string;
  tags?: string[];
  [key: string]: any;
}

interface AsyncMultiSelectProps {
  options: AsyncMultiSelectOption[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  onSearch: (query: string) => Promise<void>;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  maxDisplayedTags?: number;
  renderSelectedItem?: (option: AsyncMultiSelectOption) => React.ReactNode;
}

export const AsyncMultiSelect: React.FC<AsyncMultiSelectProps> = ({
  options,
  selectedValues,
  onSelectionChange,
  onSearch,
  placeholder = "Selecionar itens...",
  searchPlaceholder = "Buscar...",
  emptyMessage = "Nenhum resultado encontrado.",
  loading = false,
  disabled = false,
  className,
  maxDisplayedTags = 3,
  renderSelectedItem
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOptions = options.filter(option => selectedValues.includes(option.value));
  const displayedTags = selectedOptions.slice(0, maxDisplayedTags);
  const hiddenCount = selectedOptions.length - maxDisplayedTags;

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== inputValue) {
        setSearchQuery(inputValue);
        onSearch(inputValue);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [inputValue, searchQuery, onSearch]);

  const handleSelect = (value: string) => {
    const newSelection = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    onSelectionChange(newSelection);
    setInputValue('');
  };

  const handleRemove = (value: string) => {
    onSelectionChange(selectedValues.filter(v => v !== value));
  };

  const handleRemoveAll = () => {
    onSelectionChange([]);
  };

  const toggleOption = (value: string) => {
    handleSelect(value);
  };

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-[40px] p-2"
            disabled={disabled}
          >
            <div className="flex flex-wrap gap-1 flex-1 min-w-0">
              {selectedOptions.length === 0 ? (
                <span className="text-muted-foreground">{placeholder}</span>
              ) : (
                <>
                  {displayedTags.map((option) => (
                    <Badge
                      key={option.value}
                      variant="secondary"
                      className="text-xs max-w-[120px] truncate"
                    >
                      {renderSelectedItem ? (
                        renderSelectedItem(option)
                      ) : (
                        <>
                          {option.label}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemove(option.value);
                            }}
                            className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </>
                      )}
                    </Badge>
                  ))}
                  {hiddenCount > 0 && (
                    <Badge variant="outline" className="text-xs">
                      +{hiddenCount}
                    </Badge>
                  )}
                </>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              ref={inputRef}
              placeholder={searchPlaceholder}
              value={inputValue}
              onValueChange={setInputValue}
              className="h-9"
            />
            <CommandList>
              {loading && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Buscando...</span>
                </div>
              )}
              {!loading && options.length === 0 && (
                <CommandEmpty>{emptyMessage}</CommandEmpty>
              )}
              {!loading && options.length > 0 && (
                <CommandGroup>
                  {options.map((option) => {
                    const isSelected = selectedValues.includes(option.value);
                    return (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={() => toggleOption(option.value)}
                        className="flex items-center justify-between"
                      >
                        <div className="flex flex-col">
                          <span className={cn("font-medium", isSelected && "text-primary")}>
                            {option.label}
                          </span>
                          {option.description && (
                            <span className="text-xs text-muted-foreground">
                              {option.description}
                            </span>
                          )}
                          {option.tags && option.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {option.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {option.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{option.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        {isSelected && <Check className="h-4 w-4 text-primary" />}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {selectedOptions.length > 0 && (
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">
            {selectedOptions.length} item(s) selecionado(s)
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemoveAll}
            className="h-6 px-2 text-xs"
          >
            Limpar todos
          </Button>
        </div>
      )}
    </div>
  );
};
