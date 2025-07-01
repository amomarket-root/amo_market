<?php

namespace App\Http\Controllers\Information;

use App\Http\Controllers\Controller;
use App\Services\CompanyInformationService;
use Illuminate\Http\Request;

class CompanyInformationController extends Controller
{
    protected $companyInformationService;

    /**
     * Constructor
     *
     * @param CompanyInformationService $companyInformationService
     */
    public function __construct(CompanyInformationService $companyInformationService)
    {
        $this->companyInformationService = $companyInformationService;
    }

    public function getAboutUs()
    {
        $aboutUs = $this->companyInformationService->getAllAboutUs();
        return response()->json([
            'success' => true,
            'data' => $aboutUs
        ]);
    }

    public function getPrivacyPolicy()
    {
        $privacyPolicy = $this->companyInformationService->getPrivacyPolicy();
        return response()->json([
            'success' => true,
            'data' => $privacyPolicy
        ]);
    }

    public function getCareers()
    {
        $careers = $this->companyInformationService->getCareers();
        return response()->json([
            'success' => true,
            'data' => $careers
        ]);
    }

    public function getTerms()
    {
        $terms = $this->companyInformationService->getTerms();
        return response()->json([
            'success' => true,
            'data' => $terms
        ]);
    }

    public function getSecurity()
    {
        $security = $this->companyInformationService->getSecurity();
        return response()->json([
            'success' => true,
            'data' => $security
        ]);
    }

    public function getShopPage()
    {
        $shopPage = $this->companyInformationService->getShopPage();
        return response()->json([
            'success' => true,
            'data' => $shopPage
        ]);
    }

    public function getDeliveryPage()
    {
        $deliveryPage = $this->companyInformationService->getDeliveryPage();
        return response()->json([
            'success' => true,
            'data' => $deliveryPage
        ]);
    }

    public function getPaginateBlog(Request $request)
    {
        try {
            $blogs = $this->companyInformationService->getPaginateBlog($request->all());

            if ($blogs->isEmpty()) {
                return response()->json([
                    'status' => false,
                    'message' => 'No Blogs Found.',
                ], 404);
            }

            return response()->json([
                'status' => true,
                'message' => 'Blogs Retrieved Successfully.',
                'data' => $blogs,
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => $th->getMessage(),
            ], 500);
        }
    }

    public function getBlogDetails($id)
    {
        try {
            $blog = $this->companyInformationService->getBlogDetails($id);
            return response()->json([
                'status' => true,
                'message' => 'Blog Retrieved Successfully!',
                'data' => $blog,
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status' => false,
                'message' => $th->getMessage(),
            ], 500);
        }
    }
    public function getContactUs()
    {
        $contactUs = $this->companyInformationService->getContactUs();
        return response()->json([
            'success' => true,
            'data' => $contactUs
        ]);
    }
}
