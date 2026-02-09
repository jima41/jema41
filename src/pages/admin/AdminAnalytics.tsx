import { useState, useMemo, useEffect } from 'react';
import { useAnalytics } from '@/context/AnalyticsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users, Eye, MousePointerClick, Clock, TrendingUp,
  Monitor, Smartphone, Tablet, Activity, Trash2, RefreshCw,
  ArrowUp, ArrowDown, Globe,
} from 'lucide-react';

const GOLD = '#D4AF37';
const GOLD_LIGHT = '#E8D48B';
const COLORS = ['#D4AF37', '#A68A56', '#8B7D6B', '#6B5D4F', '#4A4238', '#2D251E'];

const fontSerif = { fontFamily: 'Cormorant Garamond, serif' };

export default function AdminAnalytics() {
  const { getAnalyticsStats, getAllSessions, clearAnalytics, currentSession, refreshTick } = useAnalytics();
  const [selectedView, setSelectedView] = useState<'overview' | 'pages' | 'products' | 'sessions'>('overview');
  const [now, setNow] = useState(Date.now());

  // Live timer pour les durées
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 3000);
    return () => clearInterval(id);
  }, []);

  // Recalculer les stats à chaque tick
  const stats = useMemo(() => getAnalyticsStats(), [refreshTick, now]);
  const sessions = useMemo(() => getAllSessions(), [refreshTick, now]);

  // ============================================================================
  // HELPERS
  // ============================================================================

  const fmt = (ms: number): string => {
    if (ms <= 0) return '0s';
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}h ${m % 60}m`;
    if (m > 0) return `${m}m ${s % 60}s`;
    return `${s}s`;
  };

  const fmtTime = (ts: number) => new Date(ts).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  });

  const fmtPercent = (n: number) => `${Math.round(n)}%`;

  const pageTitleMap: Record<string, string> = {
    '/': 'Accueil',
    '/all-products': 'Tous les produits',
    '/search': 'Recherche',
    '/favorites': 'Favoris',
    '/checkout': 'Checkout',
    '/login': 'Connexion',
    '/signup': 'Inscription',
    '/mes-informations': 'Mon profil',
    '/success': 'Succès',
  };

  const getPageLabel = (path: string, title?: string): string => {
    if (title && title !== path) return title;
    if (pageTitleMap[path]) return pageTitleMap[path];
    if (path.startsWith('/product/')) return 'Fiche produit';
    return path;
  };

  const deviceIcon = (device: string) => {
    if (device === 'Mobile') return <Smartphone className="w-4 h-4" />;
    if (device === 'Tablette') return <Tablet className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  // ============================================================================
  // TAB BUTTONS
  // ============================================================================

  const tabs: { key: typeof selectedView; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Vue d\'ensemble', icon: <TrendingUp className="w-4 h-4" /> },
    { key: 'pages', label: 'Pages', icon: <Globe className="w-4 h-4" /> },
    { key: 'products', label: 'Produits', icon: <Eye className="w-4 h-4" /> },
    { key: 'sessions', label: 'Sessions', icon: <Users className="w-4 h-4" /> },
  ];

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-light tracking-wider" style={fontSerif}>ANALYSE</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Affluence du site, comportement des visiteurs et métriques des produits
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
            <Activity className="w-3 h-3 text-green-500 animate-pulse" />
            <span className="text-xs text-green-500 font-medium">
              {stats.activeVisitors} en ligne
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border/30 pb-px">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setSelectedView(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${
              selectedView === tab.key
                ? 'border-[#D4AF37] text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ================================================================== */}
      {/* OVERVIEW TAB                                                       */}
      {/* ================================================================== */}
      {selectedView === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="VISITEURS AUJOURD'HUI"
              value={stats.todaySessions}
              subtitle="sessions"
              icon={<Users className="w-5 h-5" />}
            />
            <KpiCard
              title="PAGES VUES AUJOURD'HUI"
              value={stats.todayPageViews}
              subtitle="vues de pages"
              icon={<Eye className="w-5 h-5" />}
            />
            <KpiCard
              title="CLICS TOTAL"
              value={stats.totalClicks}
              subtitle="interactions"
              icon={<MousePointerClick className="w-5 h-5" />}
            />
            <KpiCard
              title="DURÉE MOYENNE"
              value={fmt(stats.averageSessionDuration)}
              subtitle="par session"
              icon={<Clock className="w-5 h-5" />}
              isText
            />
          </div>

          {/* Second row KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="TOTAL SESSIONS"
              value={stats.totalSessions}
              subtitle="depuis le début"
              icon={<TrendingUp className="w-5 h-5" />}
              small
            />
            <KpiCard
              title="PRODUITS VUS"
              value={stats.totalProductViews}
              subtitle="consultations produits"
              icon={<Eye className="w-5 h-5" />}
              small
            />
            <KpiCard
              title="TAUX DE REBOND"
              value={fmtPercent(stats.bounceRate)}
              subtitle="1 page et sortie"
              icon={stats.bounceRate > 50 ? <ArrowDown className="w-5 h-5" /> : <ArrowUp className="w-5 h-5" />}
              isText
              small
              color={stats.bounceRate > 60 ? '#ef4444' : stats.bounceRate > 40 ? '#f59e0b' : '#22c55e'}
            />
            <KpiCard
              title="TEMPS SUR PRODUIT"
              value={fmt(stats.averageProductDuration)}
              subtitle="durée moyenne"
              icon={<Clock className="w-5 h-5" />}
              isText
              small
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hourly Traffic */}
            <Card className="border border-border/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-light tracking-wider" style={fontSerif}>
                  AFFLUENCE PAR HEURE
                </CardTitle>
                <CardDescription>Répartition du trafic sur 24h</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={stats.hourlyTraffic}>
                    <defs>
                      <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={GOLD} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.3} />
                    <XAxis dataKey="hour" stroke="#666" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#666" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111', border: `1px solid ${GOLD}`, borderRadius: 8, fontSize: 12 }}
                      labelStyle={{ color: GOLD }}
                      formatter={(value: number, name: string) => [value, name === 'sessions' ? 'Sessions' : 'Pages vues']}
                    />
                    <Area type="monotone" dataKey="sessions" stroke={GOLD} fill="url(#goldGrad)" strokeWidth={2} />
                    <Area type="monotone" dataKey="views" stroke={GOLD_LIGHT} fill="transparent" strokeWidth={1.5} strokeDasharray="4 4" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Device Breakdown */}
            <Card className="border border-border/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-light tracking-wider" style={fontSerif}>
                  APPAREILS
                </CardTitle>
                <CardDescription>Répartition par type d'appareil</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-8">
                  <ResponsiveContainer width="50%" height={200}>
                    <PieChart>
                      <Pie
                        data={stats.deviceBreakdown}
                        dataKey="count"
                        nameKey="device"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                      >
                        {stats.deviceBreakdown.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#111', border: `1px solid ${GOLD}`, borderRadius: 8, fontSize: 12 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-3">
                    {stats.deviceBreakdown.map((d, i) => (
                      <div key={d.device} className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <div className="flex items-center gap-2 text-sm">
                          {deviceIcon(d.device)}
                          <span>{d.device}</span>
                        </div>
                        <span className="ml-auto text-sm font-medium" style={{ color: GOLD }}>{d.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Pages & Products side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Pages */}
            <Card className="border border-border/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-light tracking-wider" style={fontSerif}>TOP PAGES</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.pageStats.slice(0, 5).map((p, i) => (
                    <div key={p.path} className="flex items-center gap-3 py-2 border-b border-border/10 last:border-0">
                      <span className="text-xs text-muted-foreground w-5">{i + 1}.</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{getPageLabel(p.path, p.title)}</p>
                        <p className="text-xs text-muted-foreground">{p.path}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">{p.views} vues</Badge>
                    </div>
                  ))}
                  {stats.pageStats.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">Aucune donnée</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top Products Chart */}
            <Card className="border border-border/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-light tracking-wider" style={fontSerif}>TOP PRODUITS VUS</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.productStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={stats.productStats.slice(0, 5)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.3} />
                      <XAxis type="number" stroke="#666" tick={{ fontSize: 11 }} />
                      <YAxis
                        type="category"
                        dataKey="productName"
                        stroke="#666"
                        tick={{ fontSize: 11 }}
                        width={120}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#111', border: `1px solid ${GOLD}`, borderRadius: 8, fontSize: 12 }}
                        formatter={(val: number) => [`${val} vues`, 'Vues']}
                      />
                      <Bar dataKey="views" fill={GOLD} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">Aucune donnée produit</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirm('Effacer toutes les données d\'analyse ?')) {
                  clearAnalytics();
                }
              }}
              className="text-xs"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Effacer les données
            </Button>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* PAGES TAB                                                          */}
      {/* ================================================================== */}
      {selectedView === 'pages' && (
        <div className="space-y-6">
          {/* Page Distribution Chart */}
          <Card className="border border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-light tracking-wider" style={fontSerif}>
                DISTRIBUTION DES PAGES VUES
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.pageStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.pageStats.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.3} />
                    <XAxis
                      dataKey="path"
                      stroke="#666"
                      tick={{ fontSize: 10 }}
                      tickFormatter={(path) => getPageLabel(path)}
                    />
                    <YAxis stroke="#666" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111', border: `1px solid ${GOLD}`, borderRadius: 8, fontSize: 12 }}
                      labelFormatter={(path) => getPageLabel(path as string)}
                      formatter={(val: number, name: string) => [
                        name === 'views' ? `${val} vues` : name === 'totalClicks' ? `${val} clics` : val,
                        name === 'views' ? 'Vues' : 'Clics'
                      ]}
                    />
                    <Bar dataKey="views" fill={GOLD} radius={[4, 4, 0, 0]} name="views" />
                    <Bar dataKey="totalClicks" fill={GOLD_LIGHT} radius={[4, 4, 0, 0]} name="totalClicks" opacity={0.6} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">Naviguez sur le site pour générer des données</p>
              )}
            </CardContent>
          </Card>

          {/* Pages Table */}
          <Card className="border border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-light tracking-wider" style={fontSerif}>
                DÉTAIL PAR PAGE
              </CardTitle>
              <CardDescription>{stats.pageStats.length} pages trackées</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/20">
                      <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">Page</th>
                      <th className="text-center py-3 px-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">Vues</th>
                      <th className="text-center py-3 px-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">Clics</th>
                      <th className="text-center py-3 px-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">Durée moy.</th>
                      <th className="text-center py-3 px-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">Rebond</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.pageStats.map((page, idx) => (
                      <tr key={page.path} className="border-b border-border/10 hover:bg-secondary/20 transition-colors">
                        <td className="py-3 px-3">
                          <div>
                            <p className="font-medium">{getPageLabel(page.path, page.title)}</p>
                            <p className="text-xs text-muted-foreground">{page.path}</p>
                          </div>
                        </td>
                        <td className="text-center py-3 px-3">
                          <span className="font-medium" style={{ color: GOLD }}>{page.views}</span>
                        </td>
                        <td className="text-center py-3 px-3">{page.totalClicks}</td>
                        <td className="text-center py-3 px-3">{fmt(page.avgDuration)}</td>
                        <td className="text-center py-3 px-3">
                          <Badge variant={page.bounceRate > 60 ? 'destructive' : 'secondary'} className="text-xs">
                            {fmtPercent(page.bounceRate)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {stats.pageStats.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-muted-foreground">
                          Aucune donnée — naviguez sur le site pour commencer
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ================================================================== */}
      {/* PRODUCTS TAB                                                       */}
      {/* ================================================================== */}
      {selectedView === 'products' && (
        <div className="space-y-6">
          {/* Product KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <KpiCard
              title="PRODUITS VUS"
              value={stats.totalProductViews}
              subtitle="total consultations"
              icon={<Eye className="w-5 h-5" />}
              small
            />
            <KpiCard
              title="PRODUITS UNIQUES"
              value={stats.productStats.length}
              subtitle="produits différents"
              icon={<TrendingUp className="w-5 h-5" />}
              small
            />
            <KpiCard
              title="TEMPS MOY. PRODUIT"
              value={fmt(stats.averageProductDuration)}
              subtitle="par consultation"
              icon={<Clock className="w-5 h-5" />}
              isText
              small
            />
          </div>

          {/* Products Duration Chart */}
          {stats.productStats.length > 0 && (
            <Card className="border border-border/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-light tracking-wider" style={fontSerif}>
                  ENGAGEMENT PAR PRODUIT
                </CardTitle>
                <CardDescription>Temps passé et interactions par produit</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.productStats.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.3} />
                    <XAxis dataKey="productName" stroke="#666" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
                    <YAxis stroke="#666" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111', border: `1px solid ${GOLD}`, borderRadius: 8, fontSize: 12 }}
                      formatter={(val: number, name: string) => {
                        if (name === 'views') return [`${val}`, 'Vues'];
                        if (name === 'totalClicks') return [`${val}`, 'Clics'];
                        return [val, name];
                      }}
                    />
                    <Bar dataKey="views" fill={GOLD} radius={[4, 4, 0, 0]} name="views" />
                    <Bar dataKey="totalClicks" fill={GOLD_LIGHT} radius={[4, 4, 0, 0]} name="totalClicks" opacity={0.6} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Products Table */}
          <Card className="border border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-light tracking-wider" style={fontSerif}>
                MÉTRIQUES PRODUITS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/20">
                      <th className="text-left py-3 px-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">Produit</th>
                      <th className="text-center py-3 px-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">Vues</th>
                      <th className="text-center py-3 px-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">Clics</th>
                      <th className="text-center py-3 px-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">Temps moy.</th>
                      <th className="text-center py-3 px-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">Engagement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.productStats.map((product) => (
                      <tr key={product.productId} className="border-b border-border/10 hover:bg-secondary/20 transition-colors">
                        <td className="py-3 px-3">
                          <p className="font-medium">{product.productName}</p>
                        </td>
                        <td className="text-center py-3 px-3">
                          <span className="font-medium" style={{ color: GOLD }}>{product.views}</span>
                        </td>
                        <td className="text-center py-3 px-3">{product.totalClicks}</td>
                        <td className="text-center py-3 px-3">{fmt(product.avgDuration)}</td>
                        <td className="text-center py-3 px-3">
                          <div className="flex items-center justify-center gap-1">
                            <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${Math.min(product.conversionRate, 100)}%`,
                                  backgroundColor: GOLD,
                                }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">{fmtPercent(product.conversionRate)}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {stats.productStats.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-muted-foreground">
                          Aucun produit consulté — visitez des fiches produits pour commencer
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ================================================================== */}
      {/* SESSIONS TAB                                                       */}
      {/* ================================================================== */}
      {selectedView === 'sessions' && (
        <div className="space-y-6">
          {/* Current Session Live */}
          <Card className="border border-green-500/30 bg-green-500/5">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-500 animate-pulse" />
                  <CardTitle className="text-sm font-light tracking-wider" style={fontSerif}>
                    SESSION EN COURS
                  </CardTitle>
                </div>
                {currentSession && (
                  <Badge variant="outline" className="text-xs border-green-500/40 text-green-500">
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" style={{ animationDuration: '3s' }} />
                    Live
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {currentSession ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-background/50 rounded-lg border border-border/30">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Durée</p>
                      <p className="text-xl font-light" style={{ color: GOLD }}>{fmt(now - currentSession.startTime)}</p>
                    </div>
                    <div className="p-3 bg-background/50 rounded-lg border border-border/30">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Pages</p>
                      <p className="text-xl font-light" style={{ color: GOLD }}>{currentSession.pageViews.length}</p>
                    </div>
                    <div className="p-3 bg-background/50 rounded-lg border border-border/30">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Produits</p>
                      <p className="text-xl font-light" style={{ color: GOLD }}>{currentSession.productViews.length}</p>
                    </div>
                    <div className="p-3 bg-background/50 rounded-lg border border-border/30">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Clics</p>
                      <p className="text-xl font-light" style={{ color: GOLD }}>{currentSession.totalClicks}</p>
                    </div>
                  </div>

                  {/* Live page trail */}
                  {currentSession.pageViews.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Parcours de navigation</p>
                      <div className="flex flex-wrap gap-1.5">
                        {currentSession.pageViews.map((pv, i) => {
                          const isLast = i === currentSession.pageViews.length - 1;
                          const duration = pv.exitTime
                            ? pv.exitTime - pv.enterTime
                            : isLast ? now - pv.enterTime : 0;
                          return (
                            <div key={i} className="flex items-center gap-1">
                              <div className={`px-2.5 py-1 rounded text-xs border ${
                                isLast
                                  ? 'bg-[#D4AF37]/10 border-[#D4AF37]/30 text-foreground'
                                  : 'bg-secondary/30 border-border/20 text-muted-foreground'
                              }`}>
                                <span>{getPageLabel(pv.path, pv.pageTitle)}</span>
                                {duration > 0 && (
                                  <span className="ml-1.5 opacity-60">{fmt(duration)}</span>
                                )}
                              </div>
                              {i < currentSession.pageViews.length - 1 && (
                                <span className="text-muted-foreground text-xs">→</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Live product views */}
                  {currentSession.productViews.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Produits consultés</p>
                      <div className="flex flex-wrap gap-2">
                        {currentSession.productViews.map((prv, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {prv.productName}
                            <span className="ml-1.5 opacity-50">
                              {fmt(prv.exitTime ? prv.exitTime - prv.enterTime : now - prv.enterTime)}
                            </span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-2">Aucune session active</p>
              )}
            </CardContent>
          </Card>

          {/* Sessions History */}
          <Card className="border border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-light tracking-wider" style={fontSerif}>
                HISTORIQUE ({sessions.length} sessions)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {sessions
                  .sort((a, b) => b.startTime - a.startTime)
                  .slice(0, 20)
                  .map((session) => (
                    <div key={session.sessionId} className="p-4 border border-border/20 rounded-lg hover:bg-secondary/10 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {session.isActive ? (
                            <Activity className="w-3 h-3 text-green-500 animate-pulse" />
                          ) : (
                            <div className="w-3 h-3 rounded-full bg-muted" />
                          )}
                          <p className="text-sm font-medium">{fmtTime(session.startTime)}</p>
                          <Badge variant="outline" className="text-xs capitalize">
                            {session.device || 'desktop'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {session.pageViews.length} pages
                          </Badge>
                          {session.userId && (
                            <Badge variant="outline" className="text-xs text-green-500 border-green-500/30">
                              Connecté
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-3 text-xs">
                        <div>
                          <span className="text-muted-foreground">Durée</span>
                          <p className="font-medium">{fmt(session.totalDuration || (session.endTime ? session.endTime - session.startTime : now - session.startTime))}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Pages</span>
                          <p className="font-medium">{session.pageViews.length}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Produits</span>
                          <p className="font-medium">{session.productViews.length}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Clics</span>
                          <p className="font-medium">{session.totalClicks}</p>
                        </div>
                      </div>
                      {/* Page trail */}
                      {session.pageViews.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {session.pageViews.map((pv, i) => (
                            <span key={i} className="text-xs text-muted-foreground">
                              {getPageLabel(pv.path, pv.pageTitle)}{i < session.pageViews.length - 1 ? ' → ' : ''}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                {sessions.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Aucune session passée — les sessions seront enregistrées automatiquement
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// KPI CARD COMPONENT
// ============================================================================

function KpiCard({ title, value, subtitle, icon, isText, small, color }: {
  title: string;
  value: number | string;
  subtitle: string;
  icon: React.ReactNode;
  isText?: boolean;
  small?: boolean;
  color?: string;
}) {
  return (
    <Card className="border border-border/40">
      <CardContent className={small ? 'p-4' : 'p-5'}>
        <div className="flex items-start justify-between mb-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium leading-tight" style={{ fontFamily: 'Cormorant Garamond, serif', maxWidth: '80%' }}>
            {title}
          </p>
          <div className="text-muted-foreground/50">{icon}</div>
        </div>
        <p className={`${small ? 'text-2xl' : 'text-3xl'} font-light`} style={{ color: color || GOLD }}>
          {isText ? value : typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
