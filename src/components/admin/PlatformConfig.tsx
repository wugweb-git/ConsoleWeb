import React, { useState, useMemo } from 'react';
import {
  Settings,
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
  Search,
  Pencil,
  X,
  Check,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import type { ConfigCategory, ConfigItem } from '../../stores/platformConfig';
import { configGroups } from '../../stores/platformConfig';
import { IconResolver } from '../ui/IconResolver';

interface PlatformConfigProps {
  config: ConfigCategory[];
  onConfigChange: (config: ConfigCategory[]) => void;
}

export function PlatformConfig({ config, onConfigChange }: PlatformConfigProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(config[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ConfigItem>>({});
  const [addingNew, setAddingNew] = useState(false);
  const [newItem, setNewItem] = useState<Partial<ConfigItem>>({ label: '', value: '', active: true, order: 0 });
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const selectedCategory = config.find(c => c.id === selectedCategoryId);

  // Group categories by their group key, filtered by search
  const groupedCategories = useMemo(() => {
    const filtered = config.filter(c =>
      c.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const groups: { key: string; label: string; icon: string; categories: ConfigCategory[] }[] = [];
    for (const g of configGroups) {
      const cats = filtered.filter(c => c.group === g.key);
      if (cats.length > 0) {
        groups.push({ ...g, categories: cats });
      }
    }
    // Catch any ungrouped
    const ungrouped = filtered.filter(c => !configGroups.some(g => g.key === c.group));
    if (ungrouped.length > 0) {
      groups.push({ key: 'other', label: 'Other', icon: 'Settings', categories: ungrouped });
    }
    return groups;
  }, [config, searchQuery]);

  const toggleGroupCollapse = (key: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const updateItem = (categoryId: string, itemId: string, updates: Partial<ConfigItem>) => {
    const updated = config.map(cat => {
      if (cat.id !== categoryId) return cat;
      return {
        ...cat,
        items: cat.items.map(item =>
          item.id === itemId ? { ...item, ...updates } : item
        ),
      };
    });
    onConfigChange(updated);
  };

  const deleteItem = (categoryId: string, itemId: string) => {
    const updated = config.map(cat => {
      if (cat.id !== categoryId) return cat;
      return { ...cat, items: cat.items.filter(item => item.id !== itemId) };
    });
    onConfigChange(updated);
  };

  const addItem = (categoryId: string) => {
    if (!newItem.label || !newItem.value) return;
    const category = config.find(c => c.id === categoryId);
    const maxOrder = category ? Math.max(0, ...category.items.map(i => i.order)) : 0;
    const item: ConfigItem = {
      id: `${categoryId}-${Date.now()}`,
      label: newItem.label || '',
      value: newItem.value || '',
      color: newItem.color || 'var(--neutral-6)',
      bgColor: newItem.bgColor || 'var(--muted)',
      icon: newItem.icon || '',
      order: maxOrder + 1,
      active: true,
    };
    const updated = config.map(cat => {
      if (cat.id !== categoryId) return cat;
      return { ...cat, items: [...cat.items, item] };
    });
    onConfigChange(updated);
    setNewItem({ label: '', value: '', active: true, order: 0 });
    setAddingNew(false);
  };

  const startEdit = (item: ConfigItem) => {
    setEditingItemId(item.id);
    setEditForm({ ...item });
  };

  const saveEdit = (categoryId: string) => {
    if (editingItemId && editForm) {
      updateItem(categoryId, editingItemId, editForm);
      setEditingItemId(null);
      setEditForm({});
    }
  };

  // Count totals for header
  const totalCategories = config.length;
  const totalItems = config.reduce((sum, c) => sum + c.items.length, 0);
  const totalActive = config.reduce((sum, c) => sum + c.items.filter(i => i.active).length, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" style={{ minHeight: 'calc(100vh - 5rem)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 flex items-center justify-center"
            style={{ backgroundColor: 'var(--primary)', borderRadius: 'var(--radius-lg)' }}
          >
            <Settings className="w-5 h-5" style={{ color: 'var(--primary-foreground)' }} />
          </div>
          <div>
            <h2 style={{ color: 'var(--foreground)' }}>Platform Configuration</h2>
            <p style={{ color: 'var(--muted-foreground)' }}>
              Manage dynamic values used across all modules — statuses, types, tags, roles, locations & more
            </p>
          </div>
        </div>
        {/* Summary chips */}
        <div className="flex gap-2">
          {[
            { label: 'Categories', count: totalCategories },
            { label: 'Items', count: totalItems },
            { label: 'Active', count: totalActive },
          ].map(chip => (
            <div
              key={chip.label}
              className="px-3 py-1.5 flex items-center gap-1.5"
              style={{
                backgroundColor: 'var(--card)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--elevation-sm)',
              }}
            >
              <span style={{ color: 'var(--foreground)', fontWeight: 'var(--font-weight-medium)' }}>
                {chip.count}
              </span>
              <span style={{ color: 'var(--muted-foreground)' }}>{chip.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* ════════════════════════════════
            LEFT: GROUPED CATEGORY SIDEBAR
            ════════════════════════════════ */}
        <div className="lg:col-span-1">
          <div className="relative mb-3">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: 'var(--muted-foreground)' }}
            />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2"
              style={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--foreground)',
                boxShadow: 'var(--elevation-sm)',
              }}
            />
          </div>

          <div className="space-y-3">
            {groupedCategories.map(group => {
              const isCollapsed = collapsedGroups.has(group.key);
              return (
                <div key={group.key}>
                  {/* Group header */}
                  <button
                    onClick={() => toggleGroupCollapse(group.key)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 mb-1"
                  >
                    <IconResolver
                      name={group.icon}
                      className="w-3.5 h-3.5"
                      style={{ color: 'var(--muted-foreground)' }}
                    />
                    <h6 className="flex-1 text-left" style={{ color: 'var(--muted-foreground)' }}>
                      {group.label}
                    </h6>
                    <span style={{ color: 'var(--neutral-4)' }}>
                      {isCollapsed
                        ? <ChevronRight className="w-3.5 h-3.5" />
                        : <ChevronDown className="w-3.5 h-3.5" />
                      }
                    </span>
                  </button>

                  {/* Category buttons */}
                  {!isCollapsed && (
                    <div className="space-y-0.5">
                      {group.categories.map(cat => {
                        const isSelected = selectedCategoryId === cat.id;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => setSelectedCategoryId(cat.id)}
                            className="w-full text-left px-3 py-2 flex items-center gap-2.5 transition-all"
                            style={{
                              backgroundColor: isSelected ? 'var(--card)' : 'transparent',
                              boxShadow: isSelected ? 'var(--elevation-sm)' : 'none',
                              borderRadius: 'var(--radius-md)',
                            }}
                          >
                            {cat.icon && (
                              <IconResolver
                                name={cat.icon}
                                className="w-4 h-4 flex-shrink-0"
                                style={{ color: isSelected ? 'var(--foreground)' : 'var(--muted-foreground)' }}
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p
                                className="truncate"
                                style={{
                                  color: isSelected ? 'var(--foreground)' : 'var(--muted-foreground)',
                                  fontWeight: isSelected ? 'var(--font-weight-medium)' : 'var(--font-weight-regular)',
                                }}
                              >
                                {cat.label}
                              </p>
                            </div>
                            <span style={{ color: 'var(--neutral-4)' }}>
                              {cat.items.filter(i => i.active).length}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ════════════════════════════════
            RIGHT: CONFIG ITEMS TABLE
            ════════════════════════════════ */}
        <div className="lg:col-span-3">
          {selectedCategory ? (
            <div
              style={{ backgroundColor: 'var(--card)', boxShadow: 'var(--elevation-sm)', borderRadius: 'var(--radius-lg)' }}
            >
              {/* Category Header */}
              <div
                className="flex items-center justify-between px-6 py-4 border-b"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="flex items-center gap-3">
                  <IconResolver
                    name={selectedCategory.icon}
                    className="w-5 h-5"
                    style={{ color: 'var(--foreground)' }}
                  />
                  <div>
                    <h3 style={{ color: 'var(--foreground)' }}>{selectedCategory.label}</h3>
                    <p style={{ color: 'var(--muted-foreground)' }}>{selectedCategory.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setAddingNew(true)}
                  className="flex items-center gap-2 px-3 py-2"
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'var(--primary-foreground)',
                    fontWeight: 'var(--font-weight-medium)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Item</span>
                </button>
              </div>

              {/* Add New Row */}
              {addingNew && (
                <div
                  className="px-6 py-4 border-b flex items-center gap-3"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}
                >
                  <input
                    type="text"
                    placeholder="Label"
                    value={newItem.label || ''}
                    onChange={e => setNewItem({ ...newItem, label: e.target.value })}
                    className="flex-1 px-3 py-2"
                    style={{
                      backgroundColor: 'var(--input-background)',
                      border: '1px solid var(--border)',
                      color: 'var(--foreground)',
                      borderRadius: 'var(--radius-md)',
                    }}
                    autoFocus
                  />
                  <input
                    type="text"
                    placeholder="Value (slug)"
                    value={newItem.value || ''}
                    onChange={e => setNewItem({ ...newItem, value: e.target.value })}
                    className="flex-1 px-3 py-2"
                    style={{
                      backgroundColor: 'var(--input-background)',
                      border: '1px solid var(--border)',
                      color: 'var(--foreground)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Color var"
                    value={newItem.color || ''}
                    onChange={e => setNewItem({ ...newItem, color: e.target.value })}
                    className="w-36 px-3 py-2"
                    style={{
                      backgroundColor: 'var(--input-background)',
                      border: '1px solid var(--border)',
                      color: 'var(--foreground)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  />
                  <button
                    onClick={() => addItem(selectedCategory.id)}
                    className="p-2"
                    style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', borderRadius: 'var(--radius-md)' }}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { setAddingNew(false); setNewItem({ label: '', value: '', active: true, order: 0 }); }}
                    className="p-2"
                    style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground)', borderRadius: 'var(--radius-md)' }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Table Header */}
              <div
                className="grid gap-4 px-6 py-3 border-b"
                style={{
                  gridTemplateColumns: selectedCategory.id === 'statuses'
                    ? '2rem 2rem 1fr 1fr 1fr 8rem 4rem 5rem'
                    : '2rem 2rem 1fr 1fr 8rem 4rem 5rem',
                  borderColor: 'var(--border)',
                }}
              >
                <span style={{ color: 'var(--muted-foreground)' }}>#</span>
                <h6 style={{ color: 'var(--muted-foreground)' }}>Icon</h6>
                <h6 style={{ color: 'var(--muted-foreground)' }}>Label</h6>
                <h6 style={{ color: 'var(--muted-foreground)' }}>Value</h6>
                {selectedCategory.id === 'statuses' && (
                  <h6 style={{ color: 'var(--muted-foreground)' }}>Scope</h6>
                )}
                <h6 style={{ color: 'var(--muted-foreground)' }}>Color</h6>
                <h6 style={{ color: 'var(--muted-foreground)' }}>Active</h6>
                <h6 style={{ color: 'var(--muted-foreground)' }}>Actions</h6>
              </div>

              {/* Items */}
              <div>
                {[...selectedCategory.items]
                  .sort((a, b) => a.order - b.order)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="grid gap-4 px-6 py-3 border-b items-center transition-colors"
                      style={{
                        gridTemplateColumns: selectedCategory.id === 'statuses'
                          ? '2rem 2rem 1fr 1fr 1fr 8rem 4rem 5rem'
                          : '2rem 2rem 1fr 1fr 8rem 4rem 5rem',
                        borderColor: 'var(--border)',
                        opacity: item.active ? 1 : 0.5,
                      }}
                    >
                      {/* Order */}
                      <span style={{ color: 'var(--muted-foreground)' }}>{item.order}</span>

                      {/* Icon */}
                      <IconResolver
                        name={item.icon}
                        className="w-4 h-4"
                        style={{ color: item.color || 'var(--muted-foreground)' }}
                      />

                      {/* Label */}
                      {editingItemId === item.id ? (
                        <input
                          type="text"
                          value={editForm.label || ''}
                          onChange={e => setEditForm({ ...editForm, label: e.target.value })}
                          className="px-2 py-1"
                          style={{
                            backgroundColor: 'var(--input-background)',
                            border: '1px solid var(--border)',
                            color: 'var(--foreground)',
                            borderRadius: 'var(--radius-md)',
                          }}
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          {item.color && (
                            <div
                              className="w-3 h-3 flex-shrink-0"
                              style={{ backgroundColor: item.color, borderRadius: 'var(--radius-full)' }}
                            />
                          )}
                          <span style={{ color: 'var(--foreground)', fontWeight: 'var(--font-weight-medium)' }}>
                            {item.label}
                          </span>
                        </div>
                      )}

                      {/* Value */}
                      {editingItemId === item.id ? (
                        <input
                          type="text"
                          value={editForm.value || ''}
                          onChange={e => setEditForm({ ...editForm, value: e.target.value })}
                          className="px-2 py-1"
                          style={{
                            backgroundColor: 'var(--input-background)',
                            border: '1px solid var(--border)',
                            color: 'var(--foreground)',
                            borderRadius: 'var(--radius-md)',
                          }}
                        />
                      ) : (
                        <code style={{ color: 'var(--muted-foreground)' }}>{item.value}</code>
                      )}

                      {/* Scope (only for statuses) */}
                      {selectedCategory.id === 'statuses' && (
                        <div className="flex flex-wrap gap-1">
                          {(item.scope || []).map(s => (
                            <span
                              key={s}
                              className="px-1.5 py-0.5 rounded-sm"
                              style={{
                                backgroundColor: 'var(--muted)',
                                color: 'var(--muted-foreground)',
                              }}
                            >
                              <small>{s}</small>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Color swatch */}
                      {editingItemId === item.id ? (
                        <input
                          type="text"
                          value={editForm.color || ''}
                          onChange={e => setEditForm({ ...editForm, color: e.target.value })}
                          className="px-2 py-1"
                          style={{
                            backgroundColor: 'var(--input-background)',
                            border: '1px solid var(--border)',
                            color: 'var(--foreground)',
                            borderRadius: 'var(--radius-md)',
                          }}
                        />
                      ) : (
                        <div className="flex items-center gap-1.5">
                          {item.bgColor && (
                            <span
                              className="px-2 py-0.5"
                              style={{ backgroundColor: item.bgColor, color: item.color, borderRadius: 'var(--radius-sm)' }}
                            >
                              {item.label}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Toggle */}
                      <button
                        onClick={() => updateItem(selectedCategory.id, item.id, { active: !item.active })}
                      >
                        {item.active ? (
                          <ToggleRight className="w-6 h-6" style={{ color: 'var(--foreground)' }} />
                        ) : (
                          <ToggleLeft className="w-6 h-6" style={{ color: 'var(--neutral-4)' }} />
                        )}
                      </button>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {editingItemId === item.id ? (
                          <>
                            <button
                              onClick={() => saveEdit(selectedCategory.id)}
                              className="p-1.5"
                              style={{ color: 'var(--foreground)', borderRadius: 'var(--radius-md)' }}
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => { setEditingItemId(null); setEditForm({}); }}
                              className="p-1.5"
                              style={{ color: 'var(--muted-foreground)', borderRadius: 'var(--radius-md)' }}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(item)}
                              className="p-1.5"
                              style={{ color: 'var(--muted-foreground)', borderRadius: 'var(--radius-md)' }}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteItem(selectedCategory.id, item.id)}
                              className="p-1.5"
                              style={{ color: 'var(--destructive)', borderRadius: 'var(--radius-md)' }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
              </div>

              {selectedCategory.items.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--muted-foreground)' }} />
                  <p style={{ color: 'var(--foreground)' }}>No items configured</p>
                  <p style={{ color: 'var(--muted-foreground)' }}>
                    Add items to this category for components to use
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div
              className="p-12 text-center"
              style={{ backgroundColor: 'var(--card)', boxShadow: 'var(--elevation-sm)', borderRadius: 'var(--radius-lg)' }}
            >
              <Settings className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--muted-foreground)' }} />
              <h3 style={{ color: 'var(--foreground)' }}>Select a category</h3>
              <p style={{ color: 'var(--muted-foreground)' }}>
                Choose a configuration category from the left to manage its values
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}