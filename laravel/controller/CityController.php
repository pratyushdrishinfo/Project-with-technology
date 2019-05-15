<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models;
use App\Http\Requests;
use Auth;
use App\City;
use Validator;
use Route;
use DB;

class CityController extends Controller
{ 
	 /**
     * protected Variable.
     */
     protected $auth;
	 
	/**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        global $models;
		$models = new Models();
		$this->middleware('auth');
		$this->middleware(function ($request, $next) {
            $this->session = Auth::user();
			parent::__construct($this->session);
			//Checking current request is allowed or not
			$allowedAction = array('index','navigation');
			$actionData    = explode('@',Route::currentRouteAction());
			$action        = !empty($actionData[1]) ? trim(strtolower($actionData[1])): '0';			
			if(defined('NOTALlOWEDTONAVIGATE') && empty(NOTALlOWEDTONAVIGATE) && in_array($action,$allowedAction)){
				return redirect('dashboard')->withErrors('Permission Denied!');
			}
            return $next($request);
        });
    }	
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $user_id            = defined('USERID') ? USERID : '0';
		$department_ids     = defined('DEPARTMENT_IDS') ? DEPARTMENT_IDS : '0';
		$role_ids           = defined('ROLE_IDS') ? ROLE_IDS : '0';		
		
        return view('master.cities.index',['title' => 'Cities','_cities' => 'active','user_id' => $user_id,'division_id' => $division_id,'equipment_type_ids' => $equipment_type_ids]);
    }

    /** create new city
     *  Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function createCity(Request $request)
    {	
		$returnData = array(); 
 		if ($request->isMethod('post')) {
			if(!empty($request['data']['formData'])){  
				//pasrse searlize data 
				$newPostData = array(); 
				parse_str($request['data']['formData'], $newPostData);  
				unset($newPostData['_token']);
				if(empty($newPostData['city_code']))
				{
					$returnData = array('error' => config('messages.message.cityCodeRequired'));
				}else if(empty($newPostData['city_name'])){
					$returnData = array('error' => config('messages.message.cityNameRequired'));
				}else if(empty($newPostData['state_id'])){
					$returnData = array('error' => config('messages.message.cityCountryRequired'));
				}else{ 
					// check if city already exist or not 
					if($this->isCityExist($newPostData['city_code'],$newPostData['city_name']) == 0){
						$cityName = strtolower($newPostData['city_name']);
						  $created = City::create([
							'city_code' => $newPostData['city_code'],
							'state_id' => $newPostData['state_id'],
							'city_name' => ucwords($cityName),
							'created_by' => \Auth::user()->id,
						   ]);
						
						//check if users created add data in user detail
						if($created->id){ 
							$returnData = array('success' => config('messages.message.citySaved'));
						}else{
							$returnData = array('error' => config('messages.message.cityNotSaved'));
						}
					}else{
						$returnData = array('error' => config('messages.message.cityExist'));
					}
				}
			}else{
				$returnData = array('error' => config('messages.message.dataNotFoundToSaved'));
			}
		}else{
			$returnData = array('error' => config('messages.message.dataNotFoundToSaved'));
		} 
		return response()->json($returnData); 		
    }

    /**
     * Get list of cities on page load.
     * Date : 01-03-17
	 * Author : nisha
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function getCitiesList($state_id)
    { 
		global $models;	
			$cities = DB::table('city_db')
					->Join('users', 'city_db.created_by', '=', 'users.id')
					->join('state_db', 'state_db.state_id', '=', 'city_db.state_id')
					->select('city_db.*','state_db.state_name','users.name as createdBy')
					->where('state_db.country_id','=',101);
					if(!empty($state_id)){
						$cities=$cities->where('city_db.state_id','=',$state_id);	
					}
		$citiesList=$cities->orderBy('city_db.city_id','desc')->get();		
		$models->formatTimeStampFromArray($citiesList,DATETIMEFORMAT);
		return response()->json([
		   'citysList' => $citiesList,
		]);
    }   


    /**
     * isCityExist Is used to check the city duplicate entry by city_code
     * Date : 01-03-17
	 * Author : nisha
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function isCityExist($city_code,$city_name) 
    { 
		if(!empty($city_code)){
			$cityData = DB::table('city_db')
						->where('city_db.city_code', '=', $city_code)
						->orwhere('city_db.city_name', '=', $city_name)
						->first(); 
			if(@$cityData->city_id){
				return $cityData->city_id;
			}else{
				return false;
			}
		}else{
			return false;
		}
	}
	
    
    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function editCityData(Request $request)
    {
		$returnData = array();
		if ($request->isMethod('post')) {
			if(!empty($request['data']['id'])){
				$cityData = DB::table('city_db')
								->leftJoin('state_db', 'state_db.state_id', '=', 'city_db.state_id')
								->select('city_db.*','state_db.state_id')
								->where('city_db.city_id', '=', $request['data']['id'])
								->first();
				
				if($cityData->city_id){
					$returnData = array('responseData' => $cityData);				
				}else{
					$returnData = array('error' => config('messages.message.noRecordFound'));
				}
			}else{
				$returnData = array('error' => config('messages.message.dataNotFoundToSaved'));
			}
		}else{
				$returnData = array('error' => config('messages.message.provideAppData'));			
		}
		return response()->json($returnData);	
    }
    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function updateCityData(Request $request)
    {
        $returnData = array();
		if ($request->isMethod('post')) {
			if(!empty($request['data']['formData'])){   
				//pasrse searlize data 
				$newPostData = array();
				parse_str($request['data']['formData'], $newPostData);   //print_r($newPostData); die;
				if(empty($newPostData['city_id']))
				{
					$returnData = array('error' => config('messages.message.cityCodeRequired'));
				}else if(empty($newPostData['city_name'])){
					$returnData = array('error' => config('messages.message.cityNameRequired'));
				}else if(empty($newPostData['state_id'])){
					$returnData = array('error' => config('messages.message.cityCountryRequired'));
				}else{
					$newPostData['city_id']=base64_decode($newPostData['city_id']);
					$cityName = strtolower($newPostData['city_name']);
					$updated = DB::table('city_db')->where('city_id',$newPostData['city_id'])->update([
						'state_id' => $newPostData['state_id'],
						'city_name' => ucwords($cityName),
					   ]);
					//check if data updated in City table 
                    $returnData = array('success' => config('messages.message.cityUpdated'));					 
				}
			}else{
				$returnData = array('error' =>  config('messages.message.dataNotFound'));
			}
		}else{
			$returnData = array('error' => config('messages.message.dataNotFound'));
		} 
		return response()->json($returnData);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function deleteCityData(Request $request)
    {
		$returnData = array();
		if ($request->isMethod('post')){
			if(!empty($request['data']['id'])){
				try { 
					$city = DB::table('city_db')->where('city_id', $request['data']['id'])->delete();
					if($city){
						$returnData = array('success' => config('messages.message.cityDeleted'));
					}else{
						$returnData = array('error' => config('messages.message.cityNotDeleted'));					
					}
				}catch(\Illuminate\Database\QueryException $ex){ 
				   $returnData = array('error' => "Cannot delete or update a parent row: a foreign key constraint fails!");
				}
			}else{
				$returnData = array('error' => config('messages.message.noRecordFound'));
			}
		}
		return response()->json($returnData);
    }
}
