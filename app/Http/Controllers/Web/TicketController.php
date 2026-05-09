<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\View\View;

class TicketController extends Controller
{
    public function index(): View
    {
        $tickets = collect([]);

        return view('admin.tickets.index', compact('tickets'));
    }

    public function create(): View
    {
        return view('admin.tickets.create');
    }
}
