import { useState, useMemo } from 'react';
import { useAnalytics } from '@/context/AnalyticsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AdminAnalytics() {
  const { getAnalyticsStats, getAllSessions, clearAnalytics, currentSession } = useAnalytics();
  const stats = useMemo(() => getAnalyticsStats(), []);
  const [selectedView, setSelectedView] = useState<'overview' | 'pages' | 'products' | 'sessions'>('overview');

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString('fr-FR');
  };

  // Prepare chart data for page views over time
  const sessions = getAllSessions();
  const pageViewsTimeline = useMemo(() => {
    const data: any[] = [];
    sessions.forEach(session => {
      session.pageViews.forEach(pv => {
        data.push({
          time: formatTime(pv.enterTime),
          path: pv.path,
          duration: pv.duration,
          clicks: pv.clicks,
        });
      });
    });
    return data.sort((a, b) => 
      new Date(a.time).getTime() - new Date(b.time).getTime()
    ).slice(-20);
  }, [sessions]);

  const COLORS = ['#D4AF37', '#A68A56', '#8B7D6B', '#6B5D4F', '#4A4238'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className=" text-4xl font-light tracking-wider" style={{ fontFamily: 'Cormorant Garamond' }}>
          ANALYSE
        </h1>
        <p className="text-gray-600 text-sm mt-2">
          Affluence du site, comportement des visiteurs et métriques des produits
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-border">
        <Button
          variant={selectedView === 'overview' ? 'default' : 'ghost'}
          onClick={() => setSelectedView('overview')}
          className="border-none bg-transparent hover:bg-transparent"
        >
          Vue d'ensemble
        </Button>
        <Button
          variant={selectedView === 'pages' ? 'default' : 'ghost'}
          onClick={() => setSelectedView('pages')}
          className="border-none bg-transparent hover:bg-transparent"
        >
          Pages
        </Button>
        <Button
          variant={selectedView === 'products' ? 'default' : 'ghost'}
          onClick={() => setSelectedView('products')}
          className="border-none bg-transparent hover:bg-transparent"
        >
          Produits
        </Button>
        <Button
          variant={selectedView === 'sessions' ? 'default' : 'ghost'}
          onClick={() => setSelectedView('sessions')}
          className="border-none bg-transparent hover:bg-transparent"
        >
          Sessions
        </Button>
      </div>

      {/* Overview Tab */}
      {selectedView === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-border/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-light tracking-wider" style={{ fontFamily: 'Cormorant Garamond' }}>
                  SESSIONS TOTAL
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-light" style={{ color: '#D4AF37' }}>
                  {stats.totalSessions}
                </div>
                <p className="text-xs text-gray-500 mt-2">Visiteurs uniques</p>
              </CardContent>
            </Card>

            <Card className="border border-border/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-light tracking-wider" style={{ fontFamily: 'Cormorant Garamond' }}>
                  VUES PAGE
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-light" style={{ color: '#D4AF37' }}>
                  {stats.totalPageViews}
                </div>
                <p className="text-xs text-gray-500 mt-2">Vues de pages</p>
              </CardContent>
            </Card>

            <Card className="border border-border/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-light tracking-wider" style={{ fontFamily: 'Cormorant Garamond' }}>
                  CLICS TOTAL
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-light" style={{ color: '#D4AF37' }}>
                  {stats.totalClicks}
                </div>
                <p className="text-xs text-gray-500 mt-2">Interactions utilisateur</p>
              </CardContent>
            </Card>

            <Card className="border border-border/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-light tracking-wider" style={{ fontFamily: 'Cormorant Garamond' }}>
                  DURÉE MOY
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-light" style={{ color: '#D4AF37' }}>
                  {formatDuration(stats.averageSessionDuration)}
                </div>
                <p className="text-xs text-gray-500 mt-2">Par session</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Page Views Distribution */}
            <Card className="border border-border/40">
              <CardHeader>
                <CardTitle className="text-sm font-light tracking-wider" style={{ fontFamily: 'Cormorant Garamond' }}>
                  DISTRIBUTION PAGES
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.pageStats.slice(0, 5)}
                      dataKey="views"
                      nameKey="title"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {stats.pageStats.slice(0, 5).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#000',
                        border: '1px solid #D4AF37',
                        borderRadius: '4px',
                      }}
                      labelStyle={{ color: '#D4AF37' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Products Distribution */}
            <Card className="border border-border/40">
              <CardHeader>
                <CardTitle className="text-sm font-light tracking-wider" style={{ fontFamily: 'Cormorant Garamond' }}>
                  TOP PRODUITS VUS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.productStats.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="productName" stroke="#999" />
                    <YAxis stroke="#999" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#000',
                        border: '1px solid #D4AF37',
                        borderRadius: '4px',
                      }}
                      labelStyle={{ color: '#D4AF37' }}
                    />
                    <Bar dataKey="views" fill="#D4AF37" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Clear Button */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => {
                if (confirm('Êtes-vous sûr de vouloir effacer toutes les données d\'analyse ?')) {
                  clearAnalytics();
                  window.location.reload();
                }
              }}
            >
              Effacer les données
            </Button>
          </div>
        </div>
      )}

      {/* Pages Tab */}
      {selectedView === 'pages' && (
        <div className="space-y-4">
          <Card className="border border-border/40">
            <CardHeader>
              <CardTitle className="text-sm font-light tracking-wider" style={{ fontFamily: 'Cormorant Garamond' }}>
                STATISTIQUES PAGES
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border/20">
                    <tr>
                      <th className="text-left py-3 px-4 font-light" style={{ fontFamily: 'Cormorant Garamond' }}>PAGE</th>
                      <th className="text-center py-3 px-4 font-light" style={{ fontFamily: 'Cormorant Garamond' }}>VUES</th>
                      <th className="text-center py-3 px-4 font-light" style={{ fontFamily: 'Cormorant Garamond' }}>CLICS</th>
                      <th className="text-center py-3 px-4 font-light" style={{ fontFamily: 'Cormorant Garamond' }}>DURÉE MOY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.pageStats.map((page, idx) => (
                      <tr key={idx} className="border-b border-border/10">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{page.title}</p>
                            <p className="text-xs text-gray-500">{page.path}</p>
                          </div>
                        </td>
                        <td className="text-center py-3 px-4">{page.views}</td>
                        <td className="text-center py-3 px-4">{page.totalClicks}</td>
                        <td className="text-center py-3 px-4">{formatDuration(page.avgDuration)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Products Tab */}
      {selectedView === 'products' && (
        <div className="space-y-4">
          <Card className="border border-border/40">
            <CardHeader>
              <CardTitle className="text-sm font-light tracking-wider" style={{ fontFamily: 'Cormorant Garamond' }}>
                MÉTRIQUES PRODUITS
              </CardTitle>
              <CardDescription>
                Temps moyen passé sur chaque page produit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border/20">
                    <tr>
                      <th className="text-left py-3 px-4 font-light" style={{ fontFamily: 'Cormorant Garamond' }}>PRODUIT</th>
                      <th className="text-center py-3 px-4 font-light" style={{ fontFamily: 'Cormorant Garamond' }}>VUES</th>
                      <th className="text-center py-3 px-4 font-light" style={{ fontFamily: 'Cormorant Garamond' }}>CLICS</th>
                      <th className="text-center py-3 px-4 font-light" style={{ fontFamily: 'Cormorant Garamond' }}>TEMPS MOY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.productStats.map((product, idx) => (
                      <tr key={idx} className="border-b border-border/10">
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="text-xs">
                            {product.productName}
                          </Badge>
                        </td>
                        <td className="text-center py-3 px-4">{product.views}</td>
                        <td className="text-center py-3 px-4">{product.totalClicks}</td>
                        <td className="text-center py-3 px-4">{formatDuration(product.avgDuration)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sessions Tab */}
      {selectedView === 'sessions' && (
        <div className="space-y-4">
          <Card className="border border-border/40">
            <CardHeader>
              <CardTitle className="text-sm font-light tracking-wider" style={{ fontFamily: 'Cormorant Garamond' }}>
                SESSIONS ACTUELLES
              </CardTitle>
              <CardDescription>
                {currentSession ? 'Session active' : 'Aucune session active'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentSession && (
                <div className="space-y-4">
                  <div className="p-4 bg-secondary/30 rounded border border-border/40">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-widest">Durée session</p>
                        <p className="text-lg font-light">{formatDuration(Date.now() - currentSession.startTime)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-widest">Pages visitées</p>
                        <p className="text-lg font-light">{currentSession.pageViews.length}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-widest">Produits vus</p>
                        <p className="text-lg font-light">{currentSession.productViews.length}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-widest">Total clics</p>
                        <p className="text-lg font-light">{currentSession.totalClicks}</p>
                      </div>
                    </div>
                  </div>

                  {currentSession.pageViews.length > 0 && (
                    <div>
                      <h4 className="font-light text-sm mb-3" style={{ fontFamily: 'Cormorant Garamond' }}>Pages visitées</h4>
                      <div className="space-y-2">
                        {currentSession.pageViews.map((pv, idx) => (
                          <div key={idx} className="flex justify-between items-center p-2 bg-secondary/10 rounded">
                            <span className="text-sm">{pv.pageTitle}</span>
                            <span className="text-xs text-gray-500">{formatDuration(pv.duration)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentSession.productViews.length > 0 && (
                    <div>
                      <h4 className="font-light text-sm mb-3" style={{ fontFamily: 'Cormorant Garamond' }}>Produits consultés</h4>
                      <div className="space-y-2">
                        {currentSession.productViews.map((prv, idx) => (
                          <div key={idx} className="flex justify-between items-center p-2 bg-secondary/10 rounded">
                            <span className="text-sm">{prv.productName}</span>
                            <span className="text-xs text-gray-500">{formatDuration(prv.duration)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Sessions*/}
          <Card className="border border-border/40">
            <CardHeader>
              <CardTitle className="text-sm font-light tracking-wider" style={{ fontFamily: 'Cormorant Garamond' }}>
                SESSIONS RÉCENTES ({sessions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {sessions.sort((a, b) => b.startTime - a.startTime).slice(0, 10).map((session) => (
                  <div key={session.sessionId} className="p-3 border border-border/20 rounded">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-medium">{session.sessionId.substring(0, 20)}...</p>
                        <p className="text-xs text-gray-500">{formatTime(session.startTime)}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {session.pageViews.length} pages
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-gray-600">Durée:</span> {formatDuration(session.totalDuration)}
                      </div>
                      <div>
                        <span className="text-gray-600">Produits:</span> {session.productViews.length}
                      </div>
                      <div>
                        <span className="text-gray-600">Clics:</span> {session.totalClicks}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
