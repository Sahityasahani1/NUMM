import React from 'react';
import { useApp, ScreenType } from '../../context/AppContext';

interface NavItem {
  id: ScreenType;
  label: string;
  icon: string;
  badge?: number;
}

interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

export const AppShell: React.FC = () => {
  const {
    activeScreen,
    setActiveScreen,
    sidebarCollapsed,
    setSidebarCollapsed,
    sidebarOpenGroups,
    toggleSidebarGroup,
    reviewQueue,
  } = useApp();

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  const topItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'home', label: 'Problem & Architecture', icon: 'account_tree' },
  ];

  const groups: NavGroup[] = [
    {
      id: 'catalog',
      label: 'Catalog Management',
      items: [
        { id: 'master', label: 'Master Catalog', icon: 'inventory_2' },
        { id: 'manifold', label: '3D Semantic Manifold', icon: 'scatter_plot' },
        { id: 'detail', label: 'Material Spec Sheet', icon: 'description' },
        { id: 'datahub', label: 'CPSE Data Hub', icon: 'dataset' },
      ],
    },
    {
      id: 'review-ops',
      label: 'Review & Operations',
      items: [
        { id: 'harmonization', label: 'Harmonization', icon: 'tune' },
        {
          id: 'review',
          label: 'Review Queue',
          icon: 'fact_check',
          badge: reviewQueue.length,
        },
        { id: 'rationalization', label: 'Rationalization', icon: 'hub' },
        { id: 'arbitrage', label: 'Capital Arbitrage & Transfers', icon: 'currency_rupee' },
      ],
    },
    {
      id: 'governance',
      label: 'Analytics & Governance',
      items: [
        { id: 'analytics', label: 'Analytics & Savings', icon: 'analytics' },
        { id: 'governance', label: 'Audit History', icon: 'history' },
      ],
    },
  ];

  const bottomItems: NavItem[] = [
    { id: 'settings', label: 'Settings', icon: 'settings' },
    { id: 'support', label: 'Help & Support', icon: 'help' },
  ];

  const isActive = (id: ScreenType) => activeScreen === id;
  const width = sidebarCollapsed ? 'w-16' : 'w-64';

  const renderNavButton = (item: NavItem) => {
    const active = isActive(item.id);
    return (
      <button
        key={item.id}
        onClick={() => setActiveScreen(item.id)}
        title={sidebarCollapsed ? item.label : undefined}
        style={
          active
            ? {
                backgroundColor: 'var(--bg-active)',
                border: '1px solid var(--border-active)',
                color: 'var(--primary)',
              }
            : {
                backgroundColor: 'transparent',
                border: '1px solid transparent',
                color: 'var(--text-secondary)',
              }
        }
        className={`w-full flex items-center gap-3 rounded-lg transition-all duration-150 text-left hover:opacity-90 ${
          sidebarCollapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2'
        }`}
      >
        <span
          className="material-symbols-outlined text-[19px] shrink-0"
          style={{ color: active ? 'var(--primary)' : 'var(--text-muted)' }}
        >
          {item.icon}
        </span>

        {!sidebarCollapsed && (
          <span
            className="text-xs font-medium truncate flex-1 tracking-normal font-sans"
            style={{ color: active ? 'var(--primary)' : 'var(--text-secondary)' }}
          >
            {item.label}
          </span>
        )}

        {!sidebarCollapsed && item.badge !== undefined && item.badge > 0 && (
          <span
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
            }}
            className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full shrink-0"
          >
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside
      style={{
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border)',
      }}
      className={`fixed top-0 left-0 h-screen z-40 flex flex-col justify-between transition-all duration-200 select-none ${width}`}
    >
      {/* Top Brand Header */}
      <div className="flex flex-col">
        <div
          onClick={() => setActiveScreen('landing')}
          style={{ borderBottom: '1px solid var(--border)' }}
          className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:opacity-90 transition-opacity"
        >
          {/* Ashoka Lion Capital / Emblem Icon */}
          <div
            className="w-8 h-8 rounded flex items-center justify-center shrink-0"
            style={{ color: 'var(--text-primary)' }}
          >
            <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" opacity="0.1" />
              <path d="M12 3.5c-.8 0-1.5.7-1.5 1.5v.5H9c-.6 0-1 .4-1 1v1.5c0 .6.4 1 1 1h.5v1.5H8c-.6 0-1 .4-1 1v1c0 .6.4 1 1 1h1.5v2.5H8c-.6 0-1 .4-1 1v1.5h10V16c0-.6-.4-1-1-1h-1.5v-2.5H17c.6 0 1-.4 1-1v-1c0-.6-.4-1-1-1h-1.5V9H16c.6 0 1-.4 1-1V6.5c0-.6-.4-1-1-1h-1.5V5c0-.8-.7-1.5-1.5-1.5zm-2 4h4v1h-4v-1zm0 3.5h4v1h-4v-1zm-1 3.5h6v1H9v-1z" />
            </svg>
          </div>

          {!sidebarCollapsed && (
            <div className="min-w-0 flex-1">
              <h1
                className="text-xs font-bold tracking-tight truncate leading-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                National Material Master
              </h1>
              <p
                className="text-[11px] truncate leading-snug"
                style={{ color: 'var(--text-secondary)' }}
              >
                Government of India
              </p>
              <p
                className="text-[10px] font-mono truncate"
                style={{ color: 'var(--text-muted)' }}
              >
                SIH26099 • MoPNG
              </p>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-190px)]">
          {/* Top Standalone Items (Dashboard, Problem & Architecture) */}
          <div className="space-y-1">
            {topItems.map(renderNavButton)}
          </div>

          {/* Grouped Collapsible Categories */}
          {groups.map((group) => {
            const isOpen = sidebarOpenGroups.includes(group.id);
            const groupHasActive = group.items.some(i => isActive(i.id));

            return (
              <div key={group.id} className="space-y-1 pt-1">
                {/* Collapsible Category Header */}
                {!sidebarCollapsed && (
                  <button
                    onClick={() => toggleSidebarGroup(group.id)}
                    className="w-full flex items-center justify-between px-2.5 py-1 text-left text-[11px] font-semibold uppercase tracking-wider transition-colors group cursor-pointer hover:opacity-80"
                    style={{ color: groupHasActive ? 'var(--text-primary)' : 'var(--text-muted)' }}
                  >
                    <span>{group.label}</span>
                    <span
                      className="material-symbols-outlined text-[15px] transition-transform duration-200"
                      style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}
                    >
                      expand_more
                    </span>
                  </button>
                )}

                {/* Collapsible Sub-items Container */}
                <div
                  className={`accordion-content ${
                    (!sidebarCollapsed && isOpen) || sidebarCollapsed ? 'open' : 'closed'
                  } space-y-0.5`}
                >
                  {group.items.map(renderNavButton)}
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Pinned Bottom Items & Collapse toggle */}
      <div
        style={{
          borderTop: '1px solid var(--border)',
          backgroundColor: 'var(--bg-sidebar)',
        }}
        className="p-3 space-y-1"
      >
        {bottomItems.map(renderNavButton)}

        <button
          onClick={toggleSidebar}
          style={{ color: 'var(--text-muted)' }}
          className={`w-full flex items-center gap-2 rounded-lg text-xs font-medium transition-colors hover:opacity-80 ${
            sidebarCollapsed ? 'justify-center p-2' : 'px-3 py-2'
          }`}
          title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <span className="material-symbols-outlined text-[18px]">
            {sidebarCollapsed ? 'chevron_right' : 'chevron_left'}
          </span>
          {!sidebarCollapsed && <span>Collapse Menu</span>}
        </button>
      </div>
    </aside>
  );
};
