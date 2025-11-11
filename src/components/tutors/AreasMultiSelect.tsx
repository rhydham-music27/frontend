import { useState } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

interface AreasMultiSelectProps {
  areas: string[];
  selected: string[];
  onChange: (areas: string[]) => void;
  disabled?: boolean;
  error?: string;
}

export const AreasMultiSelect = ({ areas, selected, onChange, disabled, error }: AreasMultiSelectProps) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (area: string) => {
    const newSelected = selected.includes(area)
      ? selected.filter(a => a !== area)
      : [...selected, area];
    onChange(newSelected);
  };

  const handleRemove = (area: string) => {
    onChange(selected.filter(a => a !== area));
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={`w-full justify-between ${error ? 'border-red-500' : 'border-gray-300'} hover:border-[#001F54] ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="text-gray-500">
              {selected.length > 0 ? `${selected.length} area(s) selected` : 'Select areas'}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search areas..." />
            <CommandEmpty>No area found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {areas.map((area) => (
                <CommandItem
                  key={area}
                  onSelect={() => handleSelect(area)}
                  className="cursor-pointer"
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      selected.includes(area) ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                  {area}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected Areas as Badges */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((area) => (
            <Badge
              key={area}
              variant="secondary"
              className="bg-[#001F54]/10 text-[#001F54] hover:bg-[#001F54]/20"
            >
              {area}
              <button
                type="button"
                onClick={() => handleRemove(area)}
                className="ml-1 hover:text-red-500"
              >
                <X size={14} />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};