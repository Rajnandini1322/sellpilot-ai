"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Bell,
  Bot,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Package,
  Search,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

type ActivityItem = {
  action: string;
  reason: string;
  amount?: number;
  status: string;
  createdAt: string;
};

type OpportunityItem = {
  title: string;
  description: string;
  value: number;
  type: string;
};

type DashboardData = {
  revenue: number;
  paidOrders: number;
  totalOrders: number;
  conversionRate: number;
  activities: ActivityItem[];
};

type OpportunityData = {
  opportunities: OpportunityItem[];
  aiRevenueOpportunity: number;
};

function formatINR(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

function formatTime(value: string) {
  const date = new Date(value.replace(" ", "T") + "Z");

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function Home() {
  const [dashboard, setDashboard] = useState<DashboardData>({
    revenue: 0,
    paidOrders: 0,
    totalOrders: 0,
    conversionRate: 0,
    activities: [],
  });

  const [opportunityData, setOpportunityData] =
    useState<OpportunityData>({
      opportunities: [],
      aiRevenueOpportunity: 0,
    });

  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState("Dashboard");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        const dashboardResponse = await fetch("/api/dashboard");

        if (!dashboardResponse.ok) {
          throw new Error(`Dashboard API failed: ${dashboardResponse.status}`);
        }

        const dashboardData = await dashboardResponse.json();

        setDashboard({
          revenue: Number(dashboardData.revenue || 0),
          paidOrders: Number(dashboardData.paidOrders || 0),
          totalOrders: Number(dashboardData.totalOrders || 0),
          conversionRate: Number(dashboardData.conversionRate || 0),
          activities: Array.isArray(dashboardData.activities)
            ? dashboardData.activities
            : [],
        });

        try {
          const opportunityResponse =
            await fetch("/api/dashboard/opportunities");

          if (opportunityResponse.ok) {
            const opportunityData = await opportunityResponse.json();

            setOpportunityData({
              opportunities: Array.isArray(opportunityData.opportunities)
                ? opportunityData.opportunities
                : [],
              aiRevenueOpportunity: Number(
                opportunityData.aiRevenueOpportunity || 0
              ),
            });
          }
        } catch (opportunityError) {
          console.warn(
            "Opportunity data unavailable:",
            opportunityError
          );
        }
      } catch (error) {
        console.error("Dashboard loading error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const [merchantName, setMerchantName] = useState("Merchant");

useEffect(() => {
  const stored =
    localStorage.getItem("sellpilot-user") ||
    sessionStorage.getItem("sellpilot-user");

  if (!stored) {
    window.location.href = "/login";
    return;
  }

  try {
    const user = JSON.parse(stored);

    if (user?.name) {
      setMerchantName(user.name);
    }
  } catch {
    window.location.href = "/login";
  }
}, []);

const initials = getInitials(merchantName);
function handleLogout() {
  localStorage.removeItem("sellpilot-user");
  sessionStorage.removeItem("sellpilot-user");
  window.location.href = "/login";
}

  const stats = [
    {
      label: "Total Revenue",
      value: formatINR(dashboard.revenue),
      icon: CircleDollarSign,
      change: "+12.8%",
      positive: true,
    },
    {
      label: "AI Revenue Opportunity",
      value: formatINR(
        opportunityData.aiRevenueOpportunity
      ),
      icon: Sparkles,
      change: "AI detected",
      positive: true,
    },
    {
      label: "Orders",
      value: String(dashboard.paidOrders),
      icon: ShoppingCart,
      change: `${dashboard.totalOrders} total`,
      positive: true,
    },
    {
      label: "Conversion Rate",
      value: `${dashboard.conversionRate}%`,
      icon: Activity,
      change: "+2.4%",
      positive: true,
    },
  ];

  return (
    <main className="sp-app-shell">
      <aside className="sp-sidebar">
        <div className="sp-brand">
          <div className="sp-brand-mark">
            <Sparkles size={20} />
          </div>

          <div>
            <div className="sp-brand-name">
              SellPilot <span>AI</span>
            </div>
            <div className="sp-brand-subtitle">
              AI Commerce Agent
            </div>
          </div>
        </div>

        <div className="sp-project-badge">
          <div className="sp-project-dot" />
          <div>
            <strong>AI Revenue Assistant</strong>
            </div>
        </div>

        <nav className="sp-nav">
          <NavItem
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
            active={activeNav === "Dashboard"}
            onClick={() => setActiveNav("Dashboard")}
          />

          <NavItem
            icon={<Bot size={18} />}
            label="AI Agent"
            href="/agent"
          />

          <NavItem
            icon={<Package size={18} />}
            label="Catalog"
            href="/catalog"
          />

          <NavItem
            icon={<Megaphone size={18} />}
            label="Campaigns"
            href="/campaigns"
          />

          <NavItem
            icon={<ShoppingCart size={18} />}
            label="Orders"
            href="/orders"
          />

          <NavItem
            icon={<Users size={18} />}
            label="Customers"
            href="/customers"
          />

          <NavItem
            icon={<BarChart3 size={18} />}
            label="Analytics"
            href="/analytics"
          />

          <NavItem
            icon={<ShieldCheck size={18} />}
            label="Audit Trail"
            href="/audit-trail"
          />
        </nav>

        <div className="sp-sidebar-bottom">
          <div className="sp-sidebar-divider" />

          <NavItem
            icon={<Settings size={18} />}
            label="Settings"
            href="/settings"
          />

          <div className="sp-merchant-card">
            <div className="sp-avatar">{initials}</div>

            <button
              type="button"
              className="sp-signout-button"
              onClick={handleLogout}
            >
              <LogOut size={14} />
              Logout
            </button>

            <div className="sp-merchant-info">
              <strong>{merchantName}</strong>
              <span>Test Merchant</span>
            </div>

            <ChevronRight
              size={15}
              className="sp-merchant-arrow"
            />
          </div>
        </div>
      </aside>

      <section className="sp-main">
        <header className="sp-topbar">
          <div className="sp-topbar-left">
            <div className="sp-mobile-menu">
              <ClipboardList size={20} />
            </div>

            <div>
              <div className="sp-breadcrumb">
                Merchant Dashboard
              </div>

              <h1>
                Good evening, {merchantName}{" "}
        <span className="sp-wave">ðŸ‘‹</span>
              </h1>
            </div>
          </div>

          <div className="sp-topbar-actions">
            <div className="sp-search">
              <Search size={16} />
              <span>Search anything...</span>
          <kbd>âŒ˜ K</kbd>
            </div>

            <div className="sp-mode-badge">
              <span className="sp-live-dot" />
              Razorpay Test Mode
            </div>

            <button className="sp-icon-button" type="button">
              <Bell size={18} />
              <span className="sp-notification-dot" />
            </button>

            <div className="sp-top-avatar">{initials}</div>
          </div>
        </header>

        <div className="sp-content">
          <section className="sp-hero-grid">
            <div className="sp-hero-card">
              <div className="sp-hero-glow" />

              <div className="sp-hero-content">
                <div className="sp-eyebrow">
                  <Sparkles size={14} />
                  AI Revenue Intelligence
                </div>

                <h2>
                  Turn your catalog into
                  <br />
                  <span>more revenue.</span>
                </h2>

                <p>
                  SellPilot analyzes your products, customer
                  behavior and commerce activity to identify
                  revenue opportunities automatically.
                </p>

                <div className="sp-hero-actions">
                  <a href="/agent" className="sp-primary-button">
                    <Bot size={17} />
                    Open AI Agent
                    <ArrowUpRight size={16} />
                  </a>

                  <div className="sp-hero-trust">
                    <Zap size={14} />
                    AI-powered recommendations
                  </div>
                </div>
              </div>

              <div className="sp-opportunity-orb">
                <div className="sp-orb-ring ring-one" />
                <div className="sp-orb-ring ring-two" />
                <div className="sp-orb-core">
                  <Sparkles size={29} />
                </div>
              </div>
            </div>

            <div className="sp-opportunity-card">
              <div className="sp-card-topline">
                <div>
                  <span className="sp-card-label">
                    AI Revenue Opportunity
                  </span>

                  <h3>
                    {formatINR(
                      opportunityData.aiRevenueOpportunity
                    )}
                  </h3>
                </div>

                <div className="sp-ai-icon">
                  <TrendingUp size={19} />
                </div>
              </div>

              <div className="sp-opportunity-meter">
                <div
                  className="sp-opportunity-meter-fill"
                  style={{
                    width:
                      opportunityData.aiRevenueOpportunity > 0
                        ? "74%"
                        : "8%",
                  }}
                />
              </div>

              <div className="sp-opportunity-footer">
                <span>
                  <span className="sp-green-dot" />
                  Potential additional revenue
                </span>

                <strong>AI analyzed</strong>
              </div>

              <div className="sp-mini-breakdown">
                <MiniBreakdown
                  label="Upsell"
                  value="15%"
                />
                <MiniBreakdown
                  label="Cross-sell"
                  value="10%"
                />
                <MiniBreakdown
                  label="Recommendations"
                  value="8%"
                />
              </div>
            </div>
          </section>

          <section className="sp-stats-grid">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div className="sp-stat-card" key={stat.label}>
                  <div className="sp-stat-header">
                    <span>{stat.label}</span>

                    <div className="sp-stat-icon">
                      <Icon size={17} />
                    </div>
                  </div>

                  <div className="sp-stat-value">
                    {loading ? (
                      <span className="sp-skeleton-value" />
                    ) : (
                      stat.value
                    )}
                  </div>

                  <div className="sp-stat-footer">
                    <span className="sp-stat-change">
                      <ArrowUpRight size={13} />
                      {stat.change}
                    </span>

                    <span className="sp-stat-period">
                      vs last period
                    </span>
                  </div>
                </div>
              );
            })}
          </section>

          <section className="sp-dashboard-grid">
            <div className="sp-panel sp-opportunities-panel">
              <PanelHeader
                title="AI Growth Opportunities"
                subtitle="Smart actions recommended by SellPilot"
                action="View all"
              />

              <div className="sp-opportunity-list">
                {loading && (
                  <>
                    <OpportunitySkeleton />
                    <OpportunitySkeleton />
                    <OpportunitySkeleton />
                  </>
                )}

                {!loading &&
                  opportunityData.opportunities.length === 0 && (
                    <div className="sp-empty-state">
                      <Sparkles size={23} />
                      <strong>
                        No new opportunities right now
                      </strong>
                      <span>
                        SellPilot will continue analyzing your
                        catalog.
                      </span>
                    </div>
                  )}

                {!loading &&
                  opportunityData.opportunities
                    .slice(0, 5)
                    .map((opportunity, index) => (
                      <OpportunityRow
                        key={`${opportunity.title}-${index}`}
                        opportunity={opportunity}
                      />
                    ))}
              </div>
            </div>

            <div className="sp-panel">
              <PanelHeader
                title="Recent Activity"
                subtitle="Latest commerce intelligence"
                action="View audit"
              />

              <div className="sp-activity-list">
                {dashboard.activities.length === 0 ? (
                  <div className="sp-empty-state compact">
                    <Activity size={22} />
                    <span>No activity recorded yet.</span>
                  </div>
                ) : (
                  dashboard.activities
                    .slice(0, 5)
                    .map((activity, index) => (
                      <ActivityRow
                        key={`${activity.action}-${index}`}
                        activity={activity}
                      />
                    ))
                )}
              </div>
            </div>
          </section>

          <section className="sp-charts-grid">
            <RevenueChart revenue={dashboard.revenue} />

            <CategoryChart />

            <OrdersChart orders={dashboard.paidOrders} />
          </section>

          <section className="sp-bottom-banner">
            <div className="sp-bottom-title">
              <div className="sp-bottom-logo">
                <Sparkles size={18} />
              </div>

              <div>
                <strong>
                  SellPilot AI Revenue Assistant
                </strong>

                <span>
                  Intelligent commerce infrastructure for
                  modern businesses.
                </span>
              </div>
            </div>

            <div className="sp-feature-list">
              <Feature icon={<Zap size={14} />} text="AI-Powered" />
              <Feature
                icon={<ShieldCheck size={14} />}
                text="Secure"
              />
              <Feature
                icon={<TrendingUp size={14} />}
                text="Scalable"
              />
              <Feature
                icon={<ClipboardList size={14} />}
                text="Well Tested"
              />
            </div>

            <div className="sp-ready-badge">
              <span />
              100% INTERNSHIP READY
            </div>
          </section>

          <footer className="sp-footer">
            <span>
          Â© 2026 SellPilot AI. AI Commerce Intelligence.
            </span>

            <span>
          Built with Next.js Â· TypeScript Â· Prisma Â· Razorpay
            </span>
          </footer>
        </div>
      </section>
    </main>
  );
}

function NavItem({
  icon,
  label,
  active,
  href,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  href?: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      <span className="sp-nav-icon">{icon}</span>
      <span>{label}</span>
      {active && <span className="sp-nav-active-dot" />}
    </>
  );

  if (href) {
    return (
      <a className={`sp-nav-item ${active ? "active" : ""}`} href={href}>
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={`sp-nav-item ${active ? "active" : ""}`}
      onClick={onClick}
    >
      {content}
    </button>
  );
}

function PanelHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action: string;
}) {
  return (
    <div className="sp-panel-header">
      <div>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>

      <button type="button" className="sp-panel-action">
        {action}
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

function OpportunityRow({
  opportunity,
}: {
  opportunity: OpportunityItem;
}) {
  const label =
    opportunity.type === "UPSELL"
      ? "UPSELL"
      : opportunity.type === "CROSS_SELL"
        ? "CROSS-SELL"
        : "RECOMMEND";

  return (
    <div className="sp-growth-row">
      <div className="sp-growth-icon">
        <TrendingUp size={17} />
      </div>

      <div className="sp-growth-copy">
        <div className="sp-growth-title">
          {opportunity.title}
        </div>

        <div className="sp-growth-description">
          {opportunity.description}
        </div>

        <span className="sp-growth-tag">{label}</span>
      </div>

      <div className="sp-growth-value">
        <strong>{formatINR(opportunity.value)}</strong>
        <span>potential</span>
      </div>
    </div>
  );
}

function ActivityRow({
  activity,
}: {
  activity: ActivityItem;
}) {
  return (
    <div className="sp-activity-row">
      <div className="sp-activity-line">
        <span className="sp-activity-dot" />
      </div>

      <div className="sp-activity-copy">
        <strong>{activity.action}</strong>
        <span>{activity.reason}</span>
        <small>{formatTime(activity.createdAt)}</small>
      </div>

      <div
        className={`sp-status ${
          activity.status === "SUCCESS" ||
          activity.status === "PAID"
            ? "success"
            : ""
        }`}
      >
        {activity.status}
      </div>
    </div>
  );
}

function MiniBreakdown({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="sp-mini-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function OpportunitySkeleton() {
  return (
    <div className="sp-growth-row">
      <div className="sp-skeleton-icon" />
      <div className="sp-skeleton-copy">
        <span />
        <span />
      </div>
      <div className="sp-skeleton-value" />
    </div>
  );
}

function Feature({
  icon,
  text,
}: {
  icon: ReactNode;
  text: string;
}) {
  return (
    <div className="sp-feature">
      <span>{icon}</span>
      {text}
    </div>
  );
}

function RevenueChart({ revenue }: { revenue: number }) {
  const points = "0,126 45,117 90,111 135,116 180,93 225,101 270,76 315,82 360,58 405,63 450,42 495,51 540,27";
  const displayRevenue = formatINR(revenue);

  return (
    <div className="sp-panel sp-chart-panel sp-revenue-panel">
      <div className="sp-panel-header">
        <div>
          <h3>Revenue Overview</h3>
          <p>Revenue performance over time</p>
        </div>

        <div className="sp-chart-total">
          <strong>{displayRevenue}</strong>
          <span>
            <ArrowUpRight size={13} />
            12.8%
          </span>
        </div>
      </div>

      <div className="sp-line-chart">
        <div className="sp-chart-y-labels">
                <span>₹80K</span>
                <span>₹60K</span>
                <span>₹40K</span>
                <span>₹20K</span>
                <span>₹0</span>
        </div>

        <div className="sp-chart-area">
          <div className="sp-grid-lines">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>

          <svg
            viewBox="0 0 540 150"
            preserveAspectRatio="none"
            className="sp-revenue-svg"
          >
            <defs>
              <linearGradient
                id="revenueFill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="rgba(52,211,153,.24)"
                />
                <stop
                  offset="100%"
                  stopColor="rgba(52,211,153,0)"
                />
              </linearGradient>
            </defs>

            <polygon
              points={`${points} 540,150 0,150`}
              fill="url(#revenueFill)"
            />

            <polyline
              points={points}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="sp-chart-line"
            />
          </svg>
        </div>
      </div>

      <div className="sp-chart-months">
        <span>Jan</span>
        <span>Feb</span>
        <span>Mar</span>
        <span>Apr</span>
        <span>May</span>
        <span>Jun</span>
        <span>Jul</span>
        <span>Aug</span>
      </div>
    </div>
  );
}

function CategoryChart() {
  return (
    <div className="sp-panel sp-chart-panel">
      <div className="sp-panel-header">
        <div>
          <h3>Top Categories</h3>
          <p>Revenue by category</p>
        </div>

        <BarChart3 size={18} className="sp-muted-icon" />
      </div>

      <div className="sp-donut-layout">
        <div className="sp-donut">
          <div className="sp-donut-inner">
              <strong>₹1.2L</strong>
            <span>Total</span>
          </div>
        </div>

        <div className="sp-legend">
          <LegendItem label="Electronics" value="42%" />
          <LegendItem label="Accessories" value="28%" />
          <LegendItem label="Office" value="18%" />
          <LegendItem label="Other" value="12%" />
        </div>
      </div>
    </div>
  );
}

function LegendItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="sp-legend-item">
      <span className="sp-legend-marker" />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function OrdersChart({ orders }: { orders: number }) {
  const values = [31, 48, 38, 65, 51, 73, 59];

  return (
    <div className="sp-panel sp-chart-panel">
      <div className="sp-panel-header">
        <div>
          <h3>Orders Overview</h3>
          <p>Paid orders by month</p>
        </div>

        <div className="sp-orders-number">
          <strong>{orders}</strong>
          <span>orders</span>
        </div>
      </div>

      <div className="sp-bars">
        {values.map((value, index) => (
          <div className="sp-bar-column" key={index}>
            <div className="sp-bar-track">
              <div
                className="sp-bar"
                style={{ height: `${value}%` }}
              />
            </div>
            <span>
              {
                ["Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"][
                  index
                ]
              }
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}



