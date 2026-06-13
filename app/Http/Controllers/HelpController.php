<?php

namespace App\Http\Controllers;

use App\Data\HelpArticles;
use Inertia\Inertia;

class HelpController extends Controller
{
    /**
     * Help Center landing — list all categories.
     */
    public function index()
    {
        return Inertia::render('Help/Index', [
            'categories' => $this->categoriesWithCounts(),
        ]);
    }

    /**
     * Category page with article list.
     */
    public function category(string $categorySlug)
    {
        $category = HelpArticles::getCategory($categorySlug);
        
        if (!$category) {
            abort(404, 'Category not found.');
        }

        $articles = HelpArticles::articles()[$categorySlug] ?? [];
        
        // Strip content for list view (just titles/summaries)
        $articles = array_map(fn($a) => [
            'slug' => $a['slug'],
            'title' => $a['title'],
            'summary' => $a['summary'],
        ], $articles);

        return Inertia::render('Help/Category', [
            'category' => $category,
            'articles' => $articles,
            'allCategories' => $this->categoriesWithCounts(),
        ]);
    }

    /**
     * Single article page.
     */
    public function article(string $categorySlug, string $articleSlug)
    {
        $article = HelpArticles::getArticle($categorySlug, $articleSlug);
        
        if (!$article) {
            abort(404, 'Article not found.');
        }

        $category = HelpArticles::getCategory($categorySlug);
        $relatedArticles = HelpArticles::getRelated($article['related'] ?? [], $articleSlug);

        return Inertia::render('Help/Article', [
            'article' => $article,
            'category' => $category,
            'relatedArticles' => $relatedArticles,
        ]);
    }

    /**
     * Add article counts per category.
     */
    private function categoriesWithCounts(): array
    {
        $all = HelpArticles::articles();
        return array_map(function ($cat) use ($all) {
            return [
                ...$cat,
                'article_count' => count($all[$cat['slug']] ?? []),
            ];
        }, HelpArticles::categories());
    }
}