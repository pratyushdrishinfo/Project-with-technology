<?php
/*test*****/
namespace App;

use Illuminate\Notifications\Notifiable;
use Illuminate\Foundation\Auth\User as Authenticatable;

/**
 * Third Party Service for user role ...
 * URI https://github.com/httpoz/roles
 */
use HttpOz\Roles\Traits\HasRole;
use HttpOz\Roles\Contracts\HasRole as HasRoleContract;
use Illuminate\Database\Eloquent\Model;

class City extends Authenticatable implements HasRoleContract
{
    use Notifiable;
	/**
	 * Third Party Service for user role ...
	 * URI https://github.com/httpoz/roles
	 */	
	use Notifiable, HasRole;
    protected $table = 'city_db';
	
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'city_id','state_id', 'city_code', 'city_name','created_by'
    ];	

}
