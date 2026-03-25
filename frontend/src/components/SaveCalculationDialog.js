import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Save, Tag, X, Plus } from 'lucide-react';
import { toast } from 'sonner';

const SUGGESTED_TAGS = [
  'Retirement Planning',
  'Child Education',
  'House Purchase',
  'Emergency Fund',
  'Wealth Creation',
  'Tax Saving',
  'Travel Fund',
  'Wedding',
  'Business Investment',
  'Health Insurance'
];

export default function SaveCalculationDialog({ calculationType, inputs, outputs, onSaved, isGuestMode = false }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [tags, setTags] = useState([]);
  const [notes, setNotes] = useState('');
  const [customTag, setCustomTag] = useState('');

  // Show login prompt for guests
  if (isGuestMode) {
    return (
      <Button 
        onClick={() => window.location.href = '/login'}
        className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
        data-testid="save-calculation-login-prompt"
      >
        <Save className="w-4 h-4 mr-2" />
        Sign In to Save
      </Button>
    );
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Please enter a name for this calculation');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/calculations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          calculator_type: calculationType,
          inputs,
          outputs,
          name: name.trim(),
          tags,
          notes: notes.trim() || null
        }),
      });

      if (response.ok) {
        toast.success('Calculation saved successfully!');
        setOpen(false);
        // Reset form
        setName('');
        setTags([]);
        setNotes('');
        setCustomTag('');
        onSaved && onSaved();
      } else {
        toast.error('Failed to save calculation');
      }
    } catch (error) {
      console.error('Error saving calculation:', error);
      toast.error('Error saving calculation');
    } finally {
      setSaving(false);
    }
  };

  const addTag = (tag) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addCustomTag = () => {
    if (customTag.trim()) {
      addTag(customTag.trim());
      setCustomTag('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
          data-testid="save-calculation-btn"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Calculation
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white dark:bg-slate-900 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Save Calculation</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Name */}
          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Calculation Name <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="e.g., Retirement SIP - 2025"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 text-base"
              data-testid="save-calc-name-input"
            />
            <p className="text-xs text-slate-500">Give your calculation a memorable name</p>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Tags (Select or Add Custom)
            </Label>
            
            {/* Selected Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="px-3 py-1 text-sm bg-purple-600 text-white hover:bg-purple-700 cursor-pointer"
                    onClick={() => removeTag(tag)}
                    data-testid={`selected-tag-${tag}`}
                  >
                    {tag}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}

            {/* Suggested Tags */}
            <div className="space-y-2">
              <p className="text-xs text-slate-500">Suggested tags (click to add):</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_TAGS.filter(tag => !tags.includes(tag)).map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/30"
                    onClick={() => addTag(tag)}
                    data-testid={`suggested-tag-${tag}`}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Custom Tag Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Add custom tag..."
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomTag()}
                className="flex-1"
                data-testid="custom-tag-input"
              />
              <Button 
                variant="outline" 
                onClick={addCustomTag}
                data-testid="add-custom-tag-btn"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Notes (Optional)
            </Label>
            <Textarea
              placeholder="Add any notes or context for this calculation..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px] text-base"
              data-testid="save-calc-notes-input"
            />
            <p className="text-xs text-slate-500">Add context about your goals or assumptions</p>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
            data-testid="confirm-save-btn"
          >
            {saving ? 'Saving...' : 'Save Calculation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
