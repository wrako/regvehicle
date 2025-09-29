"use client";

import { useState, useTransition, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover';
import { suggestLicensePlate } from '@/ai/flows/license-plate-auto-suggest';
import { Skeleton } from '../ui/skeleton';

interface LicensePlateAutosuggestProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function LicensePlateAutosuggest({ value, onChange, placeholder, className }: LicensePlateAutosuggestProps) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, 300);

    return () => clearTimeout(handler);
  }, [value]);

  useEffect(() => {
    if (debouncedValue.length > 1) {
        setOpen(true);
        startTransition(async () => {
          const result = await suggestLicensePlate({ partialLicensePlate: debouncedValue });
          if(result?.suggestions) {
            setSuggestions(result.suggestions);
          } else {
            setSuggestions([]);
          }
        });
      } else {
        setOpen(false);
        setSuggestions([]);
      }
  }, [debouncedValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value.toUpperCase());
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <Input
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`${className} uppercase`}
          autoComplete="off"
        />
      </PopoverAnchor>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <div className="p-1">
            {isPending && (
              <div className="p-2 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-2/3" />
              </div>
            )}
            {!isPending && suggestions.length > 0 && (
                <ul className="space-y-1">
                    {suggestions.map((s, i) => (
                        <li key={i}>
                            <button
                                className="w-full text-left p-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-md"
                                onClick={() => handleSuggestionClick(s)}
                            >
                                {s}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            {!isPending && suggestions.length === 0 && debouncedValue.length > 1 && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                    Žiadne návrhy.
                </div>
            )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
